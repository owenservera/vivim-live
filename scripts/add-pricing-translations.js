/**
 * Add pricing translations to all locales
 */
const fs = require('fs');
const path = require('path');

const MESSAGES_DIR = path.join(__dirname, '../packages/frontend/src/messages');
const LOCALES = ['en', 'es', 'ca'];

const pricingTranslations = {
  en: {
    pricing: {
      sectionBadge: "Pricing",
      title: "Free intelligence. Paid convenience.",
      subtitle: "The free tier is genuinely complete. Pay only for managed convenience.",
      tiers: {
        freecore: {
          name: "Free",
          badge: "Open Core",
          price: "$0",
          period: "unlimited",
          description: "Full intelligence. No limits. Self-host forever.",
          cta: "GitHub",
          features: [
            "Full 8-layer context engine",
            "9 memory types",
            "10+ provider parsers",
            "Zero-knowledge encryption",
            "MCP server",
            "P2P network",
            "13 detection algorithms",
            "DID identity",
            "TDASS co-governance",
            "Unlimited self-hosted"
          ]
        },
        cloudPro: {
          name: "Cloud Pro",
          badge: "Most Popular",
          price: "$9",
          period: "/month",
          description: "Managed cloud. Multi-device. Priority support.",
          cta: "Get Started",
          features: [
            "Everything in FreeCore",
            "Managed cloud hosting",
            "10 GB encrypted storage",
            "Real-time sync",
            "Multi-device access",
            "Mobile app",
            "Priority support",
            "Automatic backups",
            "Usage analytics"
          ]
        },
        teams: {
          name: "Teams",
          badge: "Teams",
          price: "$25",
          period: "/seat/month",
          description: "Shared memory. Co-governance. Team admin.",
          cta: "Contact Sales",
          features: [
            "Everything in Cloud Pro",
            "Team admin dashboard",
            "Shared memory pools",
            "TDASS co-governance",
            "SSO integration",
            "Audit logs",
            "5-seat minimum",
            "Role-based access",
            "Team activity feed"
          ]
        },
        enterprise: {
          name: "Enterprise",
          badge: "Enterprise",
          price: "Custom",
          period: "",
          description: "Dedicated infrastructure. Compliance guaranteed.",
          cta: "Contact Sales",
          features: [
            "Everything in Teams",
            "Dedicated infrastructure",
            "SOC 2 / HIPAA / FedRAMP",
            "99.9% SLA guarantee",
            "On-premise option",
            "Legal hold & eDiscovery",
            "Custom integrations",
            "Dedicated support engineer",
            "Custom training"
          ]
        }
      }
    }
  },
  es: {
    pricing: {
      sectionBadge: "Precios",
      title: "Inteligencia gratuita. Comodidad pagada.",
      subtitle: "El nivel gratuito es genuinamente completo. Paga solo por conveniencia gestionada.",
      tiers: {
        freecore: {
          name: "Gratis",
          badge: "Código Abierto",
          price: "$0",
          period: "ilimitado",
          description: "Inteligencia completa. Sin límites. Autoalojado para siempre.",
          cta: "GitHub",
          features: [
            "Motor de contexto de 8 capas completo",
            "9 tipos de memoria",
            "10+ analizadores de proveedor",
            "Cifrado de conocimiento cero",
            "Servidor MCP",
            "Red P2P",
            "13 algoritmos de detección",
            "Identidad DID",
            "Co-gobernanza TDASS",
            "Autoalojado ilimitado"
          ]
        },
        cloudPro: {
          name: "Cloud Pro",
          badge: "Más Popular",
          price: "$9",
          period: "/mes",
          description: "Nube gestionada. Multi-dispositivo. Soporte prioritario.",
          cta: "Comenzar",
          features: [
            "Todo en FreeCore",
            "Hosting en nube gestionado",
            "10 GB almacenamiento cifrado",
            "Sincronización en tiempo real",
            "Acceso multi-dispositivo",
            "App móvil",
            "Soporte prioritario",
            "Copias de seguridad automáticas",
            "Analíticas de uso"
          ]
        },
        teams: {
          name: "Equipos",
          badge: "Equipos",
          price: "$25",
          period: "/asiento/mes",
          description: "Memoria compartida. Co-gobernanza. Admin de equipo.",
          cta: "Contactar Ventas",
          features: [
            "Todo en Cloud Pro",
            "Panel de administración de equipo",
            "Pools de memoria compartida",
            "Co-gobernanza TDASS",
            "Integración SSO",
            "Registros de auditoría",
            "Mínimo 5 asientos",
            "Acceso basado en roles",
            "Feed de actividad del equipo"
          ]
        },
        enterprise: {
          name: "Empresa",
          badge: "Empresa",
          price: "Personalizado",
          period: "",
          description: "Infraestructura dedicada. Cumplimiento garantizado.",
          cta: "Contactar Ventas",
          features: [
            "Todo en Equipos",
            "Infraestructura dedicada",
            "SOC 2 / HIPAA / FedRAMP",
            "Garantía SLA 99.9%",
            "Opción on-premise",
            "Retención legal y eDiscovery",
            "Integraciones personalizadas",
            "Ingeniero de soporte dedicado",
            "Entrenamiento personalizado"
          ]
        }
      }
    }
  },
  ca: {
    pricing: {
      sectionBadge: "Preus",
      title: "Intel·ligència gratuïta. Conveniència pagada.",
      subtitle: "El nivell gratuït és genuïnament complet. Paga només per conveniència gestionada.",
      tiers: {
        freecore: {
          name: "Gratuït",
          badge: "Codi Obert",
          price: "$0",
          period: "il·limitat",
          description: "Intel·ligència completa. Sense límits. Autoallotjat per sempre.",
          cta: "GitHub",
          features: [
            "Motor de context de 8 capes complet",
            "9 tipus de memòria",
            "10+ analitzadors de proveïdor",
            "Xifratge de coneixement zero",
            "Servidor MCP",
            "Xarxa P2P",
            "13 algoritmes de detecció",
            "Identitat DID",
            "Co-governança TDASS",
            "Autoallotjat il·limitat"
          ]
        },
        cloudPro: {
          name: "Cloud Pro",
          badge: "Més Popular",
          price: "$9",
          period: "/mes",
          description: "Núvol gestionat. Multi-dispositiu. Suport prioritari.",
          cta: "Començar",
          features: [
            "Tot a FreeCore",
            "Hosting al núvol gestionat",
            "10 GB emmagatzematge xifrat",
            "Sincronització en temps real",
            "Accés multi-dispositiu",
            "App mòbil",
            "Suport prioritari",
            "Còpies de seguretat automàtiques",
            "Anàliques d'ús"
          ]
        },
        teams: {
          name: "Equip",
          badge: "Equip",
          price: "$25",
          period: "/seient/mes",
          description: "Memòria compartida. Co-governança. Admin d'equip.",
          cta: "Contactar Vendes",
          features: [
            "Tot a Cloud Pro",
            "Panell d'administració d'equip",
            "Pools de memòria compartida",
            "Co-governança TDASS",
            "Integració SSO",
            "Registres d'auditoria",
            "Mínim 5 seients",
            "Accés basat en rols",
            "Feed d'activitat de l'equip"
          ]
        },
        enterprise: {
          name: "Empresa",
          badge: "Empresa",
          price: "Personalitzat",
          period: "",
          description: "Infraestructura dedicada. Compliment garantit.",
          cta: "Contactar Vendes",
          features: [
            "Tot a Equip",
            "Infraestructura dedicada",
            "SOC 2 / HIPAA / FedRAMP",
            "Garantia SLA 99.9%",
            "Opció on-premise",
            "Retenció legal i eDiscovery",
            "Integracions personalitzades",
            "Enginyer de suport dedicat",
            "Entrenament personalitzat"
          ]
        }
      }
    }
  }
};

for (const locale of LOCALES) {
  const filePath = path.join(MESSAGES_DIR, locale, 'index.json');
  const messages = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  // Merge pricing
  messages.pricing = pricingTranslations[locale].pricing;
  
  // Write back
  fs.writeFileSync(filePath, JSON.stringify(messages, null, 2) + '\n', 'utf-8');
  console.log(`✅ ${locale}: pricing section added`);
}

console.log('\nAll locales updated with pricing translations.');
