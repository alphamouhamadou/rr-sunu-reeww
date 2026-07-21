#!/bin/bash

# ================================================
# Script de déploiement OVH pour Renaissance Républicaine Sunu Reew
# ================================================

set -e

echo "🚀 Déploiement de Renaissance Républicaine Sunu Reew sur OVH"
echo "============================================================"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérification des prérequis
echo -e "${YELLOW}📋 Vérification des prérequis...${NC}"

# Vérifier Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas installé. Veuillez l'installer d'abord.${NC}"
    echo "   Ubuntu/Debian: curl -fsSL https://get.docker.com | sh"
    exit 1
fi

# Vérifier Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose n'est pas installé.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker et Docker Compose sont installés${NC}"

# Vérifier le fichier .env
if [ ! -f .env ]; then
    echo -e "${YELLOW}📝 Création du fichier .env depuis .env.example${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Veuillez éditer le fichier .env avec vos configurations avant de continuer.${NC}"
    echo "   nano .env"
    read -p "Appuyez sur Entrée une fois le fichier .env configuré..."
fi

# Créer les répertoires nécessaires
echo -e "${YELLOW}📁 Création des répertoires...${NC}"
mkdir -p data/db
mkdir -p ssl

# Construire l'image Docker
echo -e "${YELLOW}🏗️  Construction de l'image Docker...${NC}"
docker-compose build --no-cache

# Démarrer les conteneurs
echo -e "${YELLOW}🚀 Démarrage des conteneurs...${NC}"
docker-compose up -d

# Attendre que l'application soit prête
echo -e "${YELLOW}⏳ Attente du démarrage de l'application...${NC}"
sleep 10

# Vérifier la santé de l'application
if curl -s http://localhost:3000/api/seed > /dev/null; then
    echo -e "${GREEN}✅ L'application est en cours d'exécution!${NC}"
else
    echo -e "${YELLOW}⚠️  L'application démarre encore... Vérifiez les logs: docker-compose logs${NC}"
fi

# Afficher les informations de déploiement
echo ""
echo -e "${GREEN}============================================================${NC}"
echo -e "${GREEN}🎉 Déploiement terminé!${NC}"
echo -e "${GREEN}============================================================${NC}"
echo ""
echo "📍 URL locale: http://localhost:3000"
echo ""
echo "📋 Commandes utiles:"
echo "   - Voir les logs: docker-compose logs -f"
echo "   - Arrêter: docker-compose down"
echo "   - Redémarrer: docker-compose restart"
echo "   - Mettre à jour: git pull && docker-compose up -d --build"
echo ""
echo "🔐 Configuration SSL (recommandé pour la production):"
echo "   1. Installer Certbot: apt install certbot"
echo "   2. Générer le certificat: certbot certonly --standalone -d rrsunureew.sn -d www.rrsunureew.sn"
echo "   3. Copier les certificats: cp /etc/letsencrypt/live/rrsunureew.sn/* ./ssl/"
echo "   4. Redémarrer: docker-compose restart nginx"
echo ""
