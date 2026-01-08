/**
 * Copyright 2021-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

"use strict";

module.exports = Object.freeze({
  // Response messages
  APP_DEFAULT_MESSAGE: "👋 ¡Bienvenido a RaffleBot! ¿Cómo puedo ayudarte?",
  MSG_HELP: "Aquí tienes algunas cosas que puedes hacer:\n🔍 Ver Rifas\n📋 Mis Pedidos\n❓ Ayuda",
  MSG_NO_ACTIVE_RAFFLES: "No hay rifas activas en este momento. ¡Vuelve más tarde!",
  MSG_SELECT_RAFFLE: "Selecciona una rifa para ver detalles:",
  MSG_RAFFLE_DETAILS: (title, price, available) => `🎟️ *${title}*\n💰 Precio: ${price}\n🎫 Disponibles: ${available}\n\n¿Qué te gustaría hacer?`,
  MSG_HOW_MANY_TICKETS: "¿Cuántos boletos te gustaría reservar? (Escribe un número)",
  MSG_WHICH_NUMBERS: "Por favor escribe los números que deseas reservar (separados por comas, ej: 12, 15, 99):",
  MSG_RESERVED: (orderId, total, expires) => `✅ ¡Reservado!\nOrden #${orderId}\nTotal: $${total}\n\nPor favor sube el comprobante de pago antes de las ${expires}.`,
  MSG_PAYMENT_CONFIRMED: "🎉 ¡Pago confirmado! ¡Mucha suerte!",
  MSG_ERROR: "Algo salió mal. Por favor intenta de nuevo.",
  MSG_UPLOAD_PROOF: "Por favor sube la imagen del comprobante de pago ahora.",

  // Button IDs / Actions
  ACTION_BROWSE_RAFFLES: "browse_raffles",
  ACTION_MY_ORDERS: "my_orders",
  ACTION_HELP: "help",
  
  // Raffle Actions
  ACTION_BUY_RANDOM: "buy_random",
  ACTION_BUY_SPECIFIC: "buy_specific",

  // State keys (redis)
  STATE_IDLE: "IDLE",
  STATE_SELECTING_RAFFLE: "SELECTING_RAFFLE", 
  STATE_ENTERING_QTY: "ENTERING_QTY",
  STATE_ENTERING_NUMBERS: "ENTERING_NUMBERS",
  STATE_AWAITING_PROOF: "AWAITING_PROOF",
});
