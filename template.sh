#!/bin/bash

# WhatsApp Template Creation Script for Raffle System
# This script creates message templates for the raffle bot

APPTOKEN="<APP_TOKEN>"
APPID="<APP_ID>"
WABAID="<WABA_ID>"
APIVERSION="v21.0"

echo "================================================"
echo "Creating WhatsApp Templates for Raffle System"
echo "================================================"
echo ""

# Template 1: Welcome / Menu Template
echo "1. Creating welcome menu template..."
curl -X POST "https://graph.facebook.com/${APIVERSION}/${WABAID}/message_templates" \
  -H "Authorization: Bearer ${APPTOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "raffle_welcome_menu",
    "language": "es",
    "category": "utility",
    "components": [
      {
        "type": "body",
        "text": "¡Bienvenido a RaffleBot! 🎉\n\n¿Qué te gustaría hacer?"
      },
      {
        "type": "buttons",
        "buttons": [
          {
            "type": "quick_reply",
            "text": "Ver Rifas 🎫"
          },
          {
            "type": "quick_reply",
            "text": "Mis Pedidos 📋"
          },
          {
            "type": "quick_reply",
            "text": "Ayuda ❓"
          }
        ]
      }
    ]
  }'
echo ""
echo ""

# Template 2: Order Confirmation
echo "2. Creating order confirmation template..."
curl -X POST "https://graph.facebook.com/${APIVERSION}/${WABAID}/message_templates" \
  -H "Authorization: Bearer ${APPTOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "raffle_order_confirmed",
    "language": "es",
    "category": "utility",
    "components": [
      {
        "type": "body",
        "text": "✅ *¡Pedido Creado!*\n\nRifa: {{1}}\nNúmeros: {{2}}\nCantidad: {{3}}\nTotal: {{4}} {{5}}\n\n⏰ Reservado por {{6}} minutos\n\n¿Confirmas este pedido?",
        "example": {
          "body_text": [
            [
              "iPhone 15 Pro",
              "12, 45, 99",
              "3",
              "USD",
              "150.00",
              "15"
            ]
          ]
        }
      },
      {
        "type": "buttons",
        "buttons": [
          {
            "type": "quick_reply",
            "text": "Confirmar ✅"
          },
          {
            "type": "quick_reply",
            "text": "Cancelar ❌"
          }
        ]
      }
    ]
  }'
echo ""
echo ""

# Template 3: Payment Confirmed
echo "3. Creating payment confirmed template..."
curl -X POST "https://graph.facebook.com/${APIVERSION}/${WABAID}/message_templates" \
  -H "Authorization: Bearer ${APPTOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "raffle_payment_confirmed",
    "language": "es",
    "category": "utility",
    "components": [
      {
        "type": "body",
        "text": "🎉 *¡PAGO CONFIRMADO!*\n\n¡Felicidades {{1}}! Tu pago ha sido verificado.\n\n*Rifa:* {{2}}\n*Números:* {{3}}\n*Cantidad:* {{4}} boleto(s)\n*Total Pagado:* {{5}} {{6}}\n\nTus números están confirmados para el sorteo.\n\n¡Mucha suerte! 🍀",
        "example": {
          "body_text": [
            [
              "Juan Pérez",
              "iPhone 15 Pro",
              "12, 45, 99",
              "3",
              "USD",
              "150.00"
            ]
          ]
        }
      }
    ]
  }'
echo ""
echo ""

# Template 4: Payment Instructions
echo "4. Creating payment instructions template..."
curl -X POST "https://graph.facebook.com/${APIVERSION}/${WABAID}/message_templates" \
  -H "Authorization: Bearer ${APPTOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "raffle_payment_instructions",
    "language": "es",
    "category": "utility",
    "components": [
      {
        "type": "body",
        "text": "💳 *Instrucciones de Pago*\n\nMonto: {{1}} {{2}}\n\nPor favor realiza el pago y envía una captura de pantalla o foto del comprobante de pago.\n\n¡Una vez verificado, tus números serán confirmados!\n\nPedido #{{3}}",
        "example": {
          "body_text": [
            [
              "USD",
              "150.00",
              "12345"
            ]
          ]
        }
      }
    ]
  }'
echo ""
echo ""

# Template 5: New Raffle Announcement
echo "5. Creating new raffle announcement template..."
curl -X POST "https://graph.facebook.com/${APIVERSION}/${WABAID}/message_templates" \
  -H "Authorization: Bearer ${APPTOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "raffle_new_announcement",
    "language": "es",
    "category": "marketing",
    "components": [
      {
        "type": "header",
        "format": "image",
        "example": {
          "header_handle": [
            "YOUR_IMAGE_HANDLE_HERE"
          ]
        }
      },
      {
        "type": "body",
        "text": "🎉 *¡NUEVA RIFA!*\n\n{{1}}\n\n�� Precio: {{2}} {{3}} por número\n🎫 Números disponibles: {{4}}\n\n¡No te la pierdas!",
        "example": {
          "body_text": [
            [
              "iPhone 15 Pro Max - Color Negro 256GB",
              "USD",
              "50.00",
              "100"
            ]
          ]
        }
      },
      {
        "type": "buttons",
        "buttons": [
          {
            "type": "quick_reply",
            "text": "Ver Detalles ��"
          },
          {
            "type": "quick_reply",
            "text": "Participar Ahora 🎫"
          }
        ]
      }
    ]
  }'
echo ""
echo ""

# Template 6: Order Reminder (Time expiring)
echo "6. Creating order reminder template..."
curl -X POST "https://graph.facebook.com/${APIVERSION}/${WABAID}/message_templates" \
  -H "Authorization: Bearer ${APPTOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "raffle_order_reminder",
    "language": "es",
    "category": "utility",
    "components": [
      {
        "type": "body",
        "text": "⏰ *Recordatorio de Pedido*\n\nTu reserva de números expirará pronto:\n\nPedido #{{1}}\nRifa: {{2}}\nNúmeros: {{3}}\nTotal: {{4}} {{5}}\n\nTiempo restante: {{6}} minutos\n\nPor favor completa tu pago para confirmar tus números.",
        "example": {
          "body_text": [
            [
              "12345",
              "iPhone 15 Pro",
              "12, 45, 99",
              "USD",
              "150.00",
              "5"
            ]
          ]
        }
      }
    ]
  }'
echo ""
echo ""

# Template 7: Winner Announcement
echo "7. Creating winner announcement template..."
curl -X POST "https://graph.facebook.com/${APIVERSION}/${WABAID}/message_templates" \
  -H "Authorization: Bearer ${APPTOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "raffle_winner_announcement",
    "language": "es",
    "category": "utility",
    "components": [
      {
        "type": "header",
        "format": "image",
        "example": {
          "header_handle": [
            "YOUR_WINNER_IMAGE_HANDLE_HERE"
          ]
        }
      },
      {
        "type": "body",
        "text": "🎊 *¡FELICIDADES {{1}}!* 🎊\n\n¡GANASTE LA RIFA!\n\n*Rifa:* {{2}}\n*Número Ganador:* {{3}}\n\nNos pondremos en contacto contigo para coordinar la entrega de tu premio.\n\n¡Disfruta tu premio! 🎁",
        "example": {
          "body_text": [
            [
              "Juan Pérez",
              "iPhone 15 Pro",
              "45"
            ]
          ]
        }
      }
    ]
  }'
echo ""
echo ""

echo "================================================"
echo "✅ Finished creating templates!"
echo "================================================"
echo ""
echo "Notes:"
echo "- Replace <APP_TOKEN>, <APP_ID>, <WABA_ID> with your actual values"
echo "- For templates with images, upload images first and replace handle placeholders"
echo "- Templates need Meta approval before use (typically 24-48 hours)"
echo "- Check Meta Business Manager for approval status"
echo ""
