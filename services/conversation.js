"use strict";

const constants = require("./constants");
const config = require("./config");
const GraphApi = require('./graph-api');
const Message = require('./message');
const Cache = require('./redis');
const ApiClient = require('./api');

module.exports = class Conversation {
  constructor(phoneNumberId) {
    this.phoneNumberId = phoneNumberId;
  }

  static async handleMessage(senderPhoneNumberId, rawMessage) {
    const message = new Message(rawMessage);
    const waId = message.senderPhoneNumber;
    
    // 1. Ensure Contact
    try {
        // Only ensure on first message or periodically? doing it every time for simplicity now
        // Optimization: check redis cache if contact exists
        await ApiClient.ensureContact(waId, message.userName);
    } catch (e) {
        console.error("Failed to ensure contact", e);
    }

    // 2. Get State
    const stateKey = `state:${waId}`;
    let state = await Cache.get(stateKey) || { step: constants.STATE_IDLE };
    
    // 3. Process
    try {
        await this.router(senderPhoneNumberId, waId, message, state);
    } catch (e) {
        console.error("Router error", e);
        await GraphApi.sendText(message.id, senderPhoneNumberId, waId, constants.MSG_ERROR);
        await this.resetState(waId);
    }
  }

  static async router(senderPhoneNumberId, waId, message, state) {
    const step = state.step;
    const text = message.text ? message.text.toLowerCase().trim() : '';
    const type = message.type || '';

    // Global Commands & Interruptions
    if (text === 'menu' || text === 'start' || text === 'hi' || text === 'hello' || type === constants.ACTION_HELP) {
        await this.showMenu(message.id, senderPhoneNumberId, waId);
        await this.resetState(waId);
        return;
    }

    // Action Catchers (Buttons clicked from previous interactions)
    if (type.startsWith('buy_random_')) {
        const raffleId = type.replace('buy_random_', '');
        await GraphApi.sendText(message.id, senderPhoneNumberId, waId, constants.MSG_HOW_MANY_TICKETS);
        await Cache.set(`state:${waId}`, { step: constants.STATE_ENTERING_QTY, raffleId: raffleId });
        return;
    }
    
    if (type.startsWith('buy_specific_')) {
        const raffleId = type.replace('buy_specific_', '');
         // Ideally show available numbers here or just ask
        await GraphApi.sendText(message.id, senderPhoneNumberId, waId, constants.MSG_WHICH_NUMBERS);
        await Cache.set(`state:${waId}`, { step: constants.STATE_ENTERING_NUMBERS, raffleId: raffleId });
        return;
    }

    // Router
    switch (step) {
        case constants.STATE_IDLE:
            await this.handleIdle(senderPhoneNumberId, waId, message);
            break;
        case constants.STATE_SELECTING_RAFFLE:
            await this.handleSelectingRaffle(senderPhoneNumberId, waId, message);
            break;
        case constants.STATE_ENTERING_QTY:
            await this.handleEnteringQty(senderPhoneNumberId, waId, message, state);
            break;
        case constants.STATE_ENTERING_NUMBERS:
            await this.handleEnteringNumbers(senderPhoneNumberId, waId, message, state);
            break;
        case constants.STATE_AWAITING_PROOF:
            await this.handleAwaitingProof(senderPhoneNumberId, waId, message, state);
            break;
        default:
            await this.showMenu(message.id, senderPhoneNumberId, waId);
            await this.resetState(waId);
    }
  }

  static async resetState(waId) {
      await Cache.set(`state:${waId}`, { step: constants.STATE_IDLE });
  }

  static async showMenu(messageId, senderPhoneNumberId, waId) {
    await GraphApi.messageWithInteractiveReply(
        messageId, 
        senderPhoneNumberId, 
        waId, 
        constants.MSG_HELP,
        [
            { id: constants.ACTION_BROWSE_RAFFLES, title: "🔍 Ver Rifas" },
            { id: constants.ACTION_MY_ORDERS, title: "📋 Mis Pedidos" },
            { id: constants.ACTION_HELP, title: "❓ Ayuda" }
        ]
    );
  }

  // --- Handlers ---

  static async handleIdle(senderPhoneNumberId, waId, message) {
    if (message.type === constants.ACTION_BROWSE_RAFFLES || (message.text && message.text.toLowerCase().includes('raffles'))) {
        const raffles = await ApiClient.getActiveRaffles();
        
        if (raffles.length === 0) {
            await GraphApi.sendText(message.id, senderPhoneNumberId, waId, constants.MSG_NO_ACTIVE_RAFFLES);
            return;
        }

        const sections = [{
            title: "Rifas Activas",
            rows: raffles.map(r => ({
                id: `raffle_${r.id}`,
                title: r.title,
                description: `${r.currency} ${r.ticket_price} - ${r.available_count} restantes`
            }))
        }];

        await GraphApi.sendList(
            message.id, 
            senderPhoneNumberId, 
            waId, 
            "Rifas Disponibles", 
            constants.MSG_SELECT_RAFFLE, 
            "Ver Rifas", 
            sections
        );
        
        await Cache.set(`state:${waId}`, { step: constants.STATE_SELECTING_RAFFLE });
        
    } else if (message.type === constants.ACTION_MY_ORDERS) {
        await GraphApi.sendText(message.id, senderPhoneNumberId, waId, "¡Función próximamente! Contacta al admin.");
    } else {
        await this.showMenu(message.id, senderPhoneNumberId, waId);
    }
  }

  static async handleSelectingRaffle(senderPhoneNumberId, waId, message) {
    // Expecting selection from list string "raffle_{id}"
    let raffleId = null;
    
    if (message.type && message.type.startsWith('raffle_')) {
        raffleId = message.type.replace('raffle_', '');
    } else {
        // Invalid input, reset
        await this.showMenu(message.id, senderPhoneNumberId, waId);
        await this.resetState(waId);
        return;
    }

    // Fetch details
    try {
        const availability = await ApiClient.getRaffleAvailability(raffleId);
        const raffles = await ApiClient.getActiveRaffles();
        const raffle = raffles.find(r => r.id == raffleId);

        if (!raffle) {
             throw new Error("Rifa no encontrada");
        }

        const msg = constants.MSG_RAFFLE_DETAILS(raffle.title, `${raffle.currency} ${raffle.ticket_price}`, availability.available_count);
        
        await GraphApi.messageWithInteractiveReply(
            message.id, 
            senderPhoneNumberId, 
            waId, 
            msg,
            [
                { id: `buy_random_${raffleId}`, title: "🎲 Boleto al Azar" },
                { id: `buy_specific_${raffleId}`, title: "🔢 Escoger Números" }
            ]
        );
        
        // We stay in IDLE effectively because the next click is a "command" handled by router
        await this.resetState(waId);

    } catch (e) {
        await GraphApi.sendText(message.id, senderPhoneNumberId, waId, "No se pudieron cargar los detalles.");
        await this.resetState(waId);
    }
  }

  static async handleEnteringQty(senderPhoneNumberId, waId, message, state) {
      if (!message.text) {
          await GraphApi.sendText(message.id, senderPhoneNumberId, waId, "Por favor escribe un número.");
          return;
      }

      const qty = parseInt(message.text);
      if (isNaN(qty) || qty <= 0) {
          await GraphApi.sendText(message.id, senderPhoneNumberId, waId, "Número inválido. Intenta de nuevo.");
          return;
      }

      try {
          const order = await ApiClient.reserveRandom(state.raffleId, waId, qty);
          // Success
          await this.completeReservation(senderPhoneNumberId, waId, message.id, order);
      } catch (e) {
          const errorMsg = e.response?.data?.error || "Error al reservar. Tal vez ya no estén disponibles.";
          await GraphApi.sendText(message.id, senderPhoneNumberId, waId, `Error: ${errorMsg}`);
          await this.resetState(waId);
      }
  }

  static async handleEnteringNumbers(senderPhoneNumberId, waId, message, state) {
      if (!message.text) {
          await GraphApi.sendText(message.id, senderPhoneNumberId, waId, "Por favor escribe los números separados por comas.");
          return;
      }

      // Parse "1, 2, 3" -> [1, 2, 3]
      const numbers = message.text.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
      
      if (numbers.length === 0) {
           await GraphApi.sendText(message.id, senderPhoneNumberId, waId, "No se encontraron números válidos. Intenta así: 10, 20.");
           return;
      }

      try {
          const order = await ApiClient.reserveSpecific(state.raffleId, waId, numbers);
          await this.completeReservation(senderPhoneNumberId, waId, message.id, order);
      } catch (e) {
          const errorMsg = e.response?.data?.error || "Error al reservar números específicos.";
          await GraphApi.sendText(message.id, senderPhoneNumberId, waId, `Error: ${errorMsg}`);
          await this.resetState(waId);
      }
  }

  static async completeReservation(senderPhoneNumberId, waId, messageId, order) {
      const expires = new Date(order.expires_at).toLocaleTimeString();
      const msg = constants.MSG_RESERVED(order.id, order.total_amount, expires);
      
      await GraphApi.sendText(messageId, senderPhoneNumberId, waId, msg);
      await GraphApi.sendText(messageId, senderPhoneNumberId, waId, constants.MSG_UPLOAD_PROOF);

      await Cache.set(`state:${waId}`, { 
          step: constants.STATE_AWAITING_PROOF, 
          orderId: order.id 
      });
  }

  static async handleAwaitingProof(senderPhoneNumberId, waId, message, state) {
      if (message.type === 'image') {
          // User sent an image
          const mediaId = message.imageId; 
          
          try {
              await ApiClient.confirmPayment(state.orderId, mediaId);
              await GraphApi.sendText(message.id, senderPhoneNumberId, waId, constants.MSG_PAYMENT_CONFIRMED);
              await this.resetState(waId);
          } catch (e) {
               await GraphApi.sendText(message.id, senderPhoneNumberId, waId, "Error al confirmar pago. Contacta al admin.");
          }
      } else {
          await GraphApi.sendText(message.id, senderPhoneNumberId, waId, "Por favor sube una imagen como comprobante.");
      }
  }
};
