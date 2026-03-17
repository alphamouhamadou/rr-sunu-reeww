from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, Image, ListFlowable, ListItem
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.lib import colors
from reportlab.lib.units import inch, cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily
import os

# Register fonts
pdfmetrics.registerFont(TTFont('Times New Roman', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))
registerFontFamily('Times New Roman', normal='Times New Roman', bold='Times New Roman')

# Create PDF
output_path = '/home/z/my-project/download/Guide-Deploiement-OVH-RR-Sunu-Reew.pdf'
doc = SimpleDocTemplate(
    output_path,
    pagesize=A4,
    leftMargin=2*cm,
    rightMargin=2*cm,
    topMargin=2*cm,
    bottomMargin=2*cm,
    title='Guide de Déploiement OVH - Renaissance Républicaine Sunu Reew',
    author='Z.ai',
    creator='Z.ai',
    subject='Guide complet pour le déploiement de l\'application web Renaissance Républicaine Sunu Reew sur OVH'
)

# Styles
styles = getSampleStyleSheet()

title_style = ParagraphStyle(
    name='CoverTitle',
    fontName='Times New Roman',
    fontSize=32,
    leading=40,
    alignment=TA_CENTER,
    spaceAfter=24
)

subtitle_style = ParagraphStyle(
    name='CoverSubtitle',
    fontName='Times New Roman',
    fontSize=18,
    leading=24,
    alignment=TA_CENTER,
    spaceAfter=36
)

h1_style = ParagraphStyle(
    name='Heading1',
    fontName='Times New Roman',
    fontSize=20,
    leading=26,
    alignment=TA_LEFT,
    spaceBefore=24,
    spaceAfter=12,
    textColor=colors.HexColor('#1F4E79')
)

h2_style = ParagraphStyle(
    name='Heading2',
    fontName='Times New Roman',
    fontSize=16,
    leading=22,
    alignment=TA_LEFT,
    spaceBefore=18,
    spaceAfter=8,
    textColor=colors.HexColor('#2E75B6')
)

h3_style = ParagraphStyle(
    name='Heading3',
    fontName='Times New Roman',
    fontSize=14,
    leading=18,
    alignment=TA_LEFT,
    spaceBefore=12,
    spaceAfter=6,
    textColor=colors.HexColor('#5B9BD5')
)

body_style = ParagraphStyle(
    name='BodyStyle',
    fontName='Times New Roman',
    fontSize=11,
    leading=16,
    alignment=TA_JUSTIFY,
    spaceAfter=8
)

code_style = ParagraphStyle(
    name='CodeStyle',
    fontName='Times New Roman',
    fontSize=10,
    leading=14,
    alignment=TA_LEFT,
    backColor=colors.HexColor('#F5F5F5'),
    leftIndent=10,
    rightIndent=10,
    spaceBefore=6,
    spaceAfter=6
)

note_style = ParagraphStyle(
    name='NoteStyle',
    fontName='Times New Roman',
    fontSize=10,
    leading=14,
    alignment=TA_LEFT,
    backColor=colors.HexColor('#FFF3CD'),
    leftIndent=10,
    rightIndent=10,
    spaceBefore=6,
    spaceAfter=6,
    borderPadding=8
)

table_header_style = ParagraphStyle(
    name='TableHeader',
    fontName='Times New Roman',
    fontSize=10,
    textColor=colors.white,
    alignment=TA_CENTER
)

table_cell_style = ParagraphStyle(
    name='TableCell',
    fontName='Times New Roman',
    fontSize=10,
    alignment=TA_CENTER
)

story = []

# Cover Page
story.append(Spacer(1, 100))
story.append(Paragraph('<b>Guide de Déploiement OVH</b>', title_style))
story.append(Spacer(1, 20))
story.append(Paragraph('<b>Renaissance Républicaine Sunu Reew</b>', subtitle_style))
story.append(Spacer(1, 40))
story.append(Paragraph('Application Web de Gestion des Membres', ParagraphStyle(
    name='CoverDesc',
    fontName='Times New Roman',
    fontSize=14,
    alignment=TA_CENTER
)))
story.append(Spacer(1, 60))
story.append(Paragraph('Version 1.0 - Janvier 2025', ParagraphStyle(
    name='CoverDate',
    fontName='Times New Roman',
    fontSize=12,
    alignment=TA_CENTER
)))
story.append(PageBreak())

# Table of Contents
story.append(Paragraph('<b>Table des Matières</b>', h1_style))
story.append(Spacer(1, 12))

toc_items = [
    ('1. Introduction', 'Objectif et portée du guide'),
    ('2. Prérequis', 'Serveur OVH et logiciels nécessaires'),
    ('3. Préparation du Serveur', 'Configuration initiale du VPS'),
    ('4. Transfert des Fichiers', 'Méthodes de déploiement'),
    ('5. Configuration SSL', 'Certificats HTTPS avec Let\'s Encrypt'),
    ('6. Mise en Production', 'Démarrage et vérification'),
    ('7. Maintenance', 'Mises à jour et sauvegardes'),
    ('8. Dépannage', 'Problèmes courants et solutions'),
]

for item, desc in toc_items:
    story.append(Paragraph(f'<b>{item}</b> - {desc}', body_style))

story.append(PageBreak())

# Section 1: Introduction
story.append(Paragraph('<b>1. Introduction</b>', h1_style))
story.append(Spacer(1, 12))

story.append(Paragraph('<b>1.1 Objectif</b>', h2_style))
story.append(Paragraph(
    'Ce guide détaille la procédure complète pour déployer l\'application web Renaissance Républicaine Sunu Reew '
    'sur un serveur OVH. L\'application est une plateforme de gestion des membres d\'un parti politique sénégalais, '
    'incluant la gestion des adhérents, les contributions financières, les événements, et l\'intégration de paiements '
    'mobiles via PayTech (Wave, Orange Money). Le déploiement utilise Docker pour la containerisation, ce qui garantit '
    'une installation reproductible et une maintenance simplifiée sur le long terme.',
    body_style
))

story.append(Paragraph('<b>1.2 Architecture</b>', h2_style))
story.append(Paragraph(
    'L\'application est construite avec Next.js 15, un framework React moderne côté serveur. Elle utilise une base '
    'de données SQLite via Prisma ORM pour la persistance des données. Le tout est containerisé avec Docker et orchestré '
    'via Docker Compose. Un serveur Nginx fait office de reverse proxy pour gérer les requêtes HTTPS et la redirection '
    'HTTP vers HTTPS. Cette architecture permet une scalabilité horizontale et une isolation complète des services.',
    body_style
))

# Architecture table
arch_data = [
    [Paragraph('<b>Composant</b>', table_header_style), Paragraph('<b>Technologie</b>', table_header_style), Paragraph('<b>Port</b>', table_header_style)],
    [Paragraph('Application Web', table_cell_style), Paragraph('Next.js 15 + React', table_cell_style), Paragraph('3000', table_cell_style)],
    [Paragraph('Base de données', table_cell_style), Paragraph('SQLite + Prisma', table_cell_style), Paragraph('Fichier', table_cell_style)],
    [Paragraph('Reverse Proxy', table_cell_style), Paragraph('Nginx', table_cell_style), Paragraph('80, 443', table_cell_style)],
    [Paragraph('Containerisation', table_cell_style), Paragraph('Docker + Compose', table_cell_style), Paragraph('-', table_cell_style)],
]

arch_table = Table(arch_data, colWidths=[4*cm, 5*cm, 3*cm])
arch_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('TOPPADDING', (0, 0), (-1, -1), 8),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
]))
story.append(Spacer(1, 12))
story.append(arch_table)
story.append(Spacer(1, 6))
story.append(Paragraph('<i>Tableau 1: Architecture technique de l\'application</i>', ParagraphStyle(
    name='Caption',
    fontName='Times New Roman',
    fontSize=10,
    alignment=TA_CENTER,
    textColor=colors.grey
)))
story.append(Spacer(1, 18))

# Section 2: Prérequis
story.append(Paragraph('<b>2. Prérequis</b>', h1_style))
story.append(Spacer(1, 12))

story.append(Paragraph('<b>2.1 Serveur OVH Recommandé</b>', h2_style))
story.append(Paragraph(
    'Pour un déploiement optimal de l\'application, nous recommandons un VPS OVH de la gamme "Starter" ou supérieure. '
    'Le VPS Starter offre un excellent rapport qualité-prix pour une application de cette envergure, avec suffisamment '
    'de ressources pour gérer des milliers de membres et des pics de trafic lors d\'événements politiques importants.',
    body_style
))

vps_data = [
    [Paragraph('<b>Ressource</b>', table_header_style), Paragraph('<b>Minimum</b>', table_header_style), Paragraph('<b>Recommandé</b>', table_header_style)],
    [Paragraph('CPU', table_cell_style), Paragraph('1 vCore', table_cell_style), Paragraph('2 vCores', table_cell_style)],
    [Paragraph('RAM', table_cell_style), Paragraph('2 Go', table_cell_style), Paragraph('4 Go', table_cell_style)],
    [Paragraph('Stockage', table_cell_style), Paragraph('20 Go SSD', table_cell_style), Paragraph('40 Go SSD', table_cell_style)],
    [Paragraph('OS', table_cell_style), Paragraph('Ubuntu 22.04', table_cell_style), Paragraph('Ubuntu 24.04', table_cell_style)],
]

vps_table = Table(vps_data, colWidths=[4*cm, 4*cm, 4*cm])
vps_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('TOPPADDING', (0, 0), (-1, -1), 8),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
]))
story.append(Spacer(1, 12))
story.append(vps_table)
story.append(Spacer(1, 6))
story.append(Paragraph('<i>Tableau 2: Configuration serveur recommandée</i>', ParagraphStyle(
    name='Caption',
    fontName='Times New Roman',
    fontSize=10,
    alignment=TA_CENTER,
    textColor=colors.grey
)))
story.append(Spacer(1, 18))

story.append(Paragraph('<b>2.2 Domaine et DNS</b>', h2_style))
story.append(Paragraph(
    'Vous devez disposer d\'un nom de domaine configuré pour pointer vers l\'adresse IP de votre serveur OVH. '
    'Le domaine recommandé est <b>rrsunureew.sn</b> pour le Sénégal. La configuration DNS doit inclure les enregistrements '
    'A pour le domaine principal et www, pointant vers l\'adresse IP publique du VPS. Cette configuration est essentielle '
    'pour le fonctionnement des certificats SSL Let\'s Encrypt et l\'accès public à l\'application.',
    body_style
))

story.append(Paragraph('<b>2.3 Logiciels Requis</b>', h2_style))
story.append(Paragraph(
    'Le serveur doit avoir Docker et Docker Compose installés. Ces outils permettent de lancer l\'application '
    'dans des conteneurs isolés, garantissant une exécution cohérente quel que soit l\'environnement. Git est également '
    'nécessaire pour cloner le dépôt du code source. L\'installation de ces outils est détaillée dans la section suivante.',
    body_style
))

# Section 3: Préparation du Serveur
story.append(Paragraph('<b>3. Préparation du Serveur</b>', h1_style))
story.append(Spacer(1, 12))

story.append(Paragraph('<b>3.1 Connexion SSH</b>', h2_style))
story.append(Paragraph(
    'Connectez-vous à votre serveur OVH via SSH depuis votre terminal local. Utilisez l\'adresse IP ou le nom de domaine '
    'si déjà configuré. La connexion SSH vous permettra d\'exécuter toutes les commandes nécessaires à l\'installation '
    'et à la configuration de l\'application. Assurez-vous de disposer des identifiants root ou d\'un utilisateur avec '
    'les privilèges sudo.',
    body_style
))

story.append(Paragraph('<b>Commande de connexion:</b>', ParagraphStyle(
    name='CodeLabel',
    fontName='Times New Roman',
    fontSize=10,
    spaceBefore=12,
    spaceAfter=4
)))
story.append(Paragraph('ssh root@VOTRE_IP_OVH', code_style))
story.append(Spacer(1, 12))

story.append(Paragraph('<b>3.2 Mise à jour du Système</b>', h2_style))
story.append(Paragraph(
    'Avant d\'installer Docker, il est recommandé de mettre à jour tous les paquets du système pour bénéficier '
    'des dernières corrections de sécurité et des paquets les plus récents. Cette étape garantit la stabilité '
    'et la sécurité de votre serveur avant l\'installation de logiciels supplémentaires.',
    body_style
))

story.append(Paragraph('<b>Commandes de mise à jour:</b>', ParagraphStyle(
    name='CodeLabel',
    fontName='Times New Roman',
    fontSize=10,
    spaceBefore=12,
    spaceAfter=4
)))
story.append(Paragraph('apt update && apt upgrade -y', code_style))
story.append(Spacer(1, 12))

story.append(Paragraph('<b>3.3 Installation de Docker</b>', h2_style))
story.append(Paragraph(
    'Docker est la plateforme de containerisation qui permet d\'exécuter l\'application dans un environnement '
    'isolé et reproductible. L\'installation via le script officiel Docker est la méthode la plus simple et '
    'la plus fiable. Ce script télécharge et installe automatiquement la dernière version stable de Docker '
    'ainsi que Docker Compose, l\'outil d\'orchestration des conteneurs.',
    body_style
))

story.append(Paragraph('<b>Installation automatique de Docker:</b>', ParagraphStyle(
    name='CodeLabel',
    fontName='Times New Roman',
    fontSize=10,
    spaceBefore=12,
    spaceAfter=4
)))
story.append(Paragraph('curl -fsSL https://get.docker.com | sh', code_style))
story.append(Spacer(1, 8))
story.append(Paragraph('usermod -aG docker $USER', code_style))
story.append(Spacer(1, 12))

story.append(Paragraph(
    'Après l\'installation, déconnectez-vous et reconnectez-vous pour appliquer les permissions du groupe Docker. '
    'Vous pouvez vérifier que Docker fonctionne correctement en exécutant la commande de test suivante, qui '
    'télécharge et exécute une image de test.',
    body_style
))

story.append(Paragraph('<b>Vérification de Docker:</b>', ParagraphStyle(
    name='CodeLabel',
    fontName='Times New Roman',
    fontSize=10,
    spaceBefore=12,
    spaceAfter=4
)))
story.append(Paragraph('docker run hello-world', code_style))
story.append(Spacer(1, 12))

story.append(Paragraph('<b>3.4 Installation de Git</b>', h2_style))
story.append(Paragraph(
    'Git est nécessaire pour cloner le dépôt de code source de l\'application. Si votre code est hébergé '
    'sur GitHub, GitLab ou un autre service de gestion de code, vous pourrez le récupérer facilement. '
    'Git permet également de gérer les mises à jour ultérieures du code en tirant les dernières modifications.',
    body_style
))

story.append(Paragraph('<b>Installation de Git:</b>', ParagraphStyle(
    name='CodeLabel',
    fontName='Times New Roman',
    fontSize=10,
    spaceBefore=12,
    spaceAfter=4
)))
story.append(Paragraph('apt install git -y', code_style))
story.append(Spacer(1, 18))

# Section 4: Transfert des Fichiers
story.append(Paragraph('<b>4. Transfert des Fichiers</b>', h1_style))
story.append(Spacer(1, 12))

story.append(Paragraph('<b>4.1 Méthode SCP (Recommandée)</b>', h2_style))
story.append(Paragraph(
    'La méthode la plus simple pour transférer les fichiers vers le serveur OVH est d\'utiliser SCP (Secure Copy). '
    'Cette commande permet de copier récursivement tout le dossier du projet depuis votre machine locale vers '
    'le serveur distant. Assurez-vous que le dossier source contient tous les fichiers nécessaires au déploiement, '
    'incluant le Dockerfile, docker-compose.yml, et tous les fichiers source de l\'application.',
    body_style
))

story.append(Paragraph('<b>Commande de transfert SCP:</b>', ParagraphStyle(
    name='CodeLabel',
    fontName='Times New Roman',
    fontSize=10,
    spaceBefore=12,
    spaceAfter=4
)))
story.append(Paragraph('scp -r /chemin/vers/projet root@VOTRE_IP_OVH:/opt/rr-sunu-reew', code_style))
story.append(Spacer(1, 12))

story.append(Paragraph('<b>4.2 Configuration des Variables d\'Environnement</b>', h2_style))
story.append(Paragraph(
    'Avant de lancer l\'application, vous devez configurer les variables d\'environnement dans un fichier .env. '
    'Ce fichier contient les clés API pour PayTech, l\'URL de l\'application, et d\'autres paramètres sensibles. '
    'Copiez le fichier .env.example en .env et modifiez les valeurs selon votre configuration. Les clés PayTech '
    'peuvent être obtenues en créant un compte marchand sur paytech.sn.',
    body_style
))

story.append(Paragraph('<b>Création du fichier .env:</b>', ParagraphStyle(
    name='CodeLabel',
    fontName='Times New Roman',
    fontSize=10,
    spaceBefore=12,
    spaceAfter=4
)))
story.append(Paragraph('cd /opt/rr-sunu-reew', code_style))
story.append(Spacer(1, 4))
story.append(Paragraph('cp .env.example .env', code_style))
story.append(Spacer(1, 4))
story.append(Paragraph('nano .env', code_style))
story.append(Spacer(1, 12))

env_data = [
    [Paragraph('<b>Variable</b>', table_header_style), Paragraph('<b>Description</b>', table_header_style), Paragraph('<b>Exemple</b>', table_header_style)],
    [Paragraph('NEXT_PUBLIC_APP_URL', table_cell_style), Paragraph('URL publique de l\'application', table_cell_style), Paragraph('https://rrsunureew.sn', table_cell_style)],
    [Paragraph('PAYTECH_API_KEY', table_cell_style), Paragraph('Clé API PayTech', table_cell_style), Paragraph('your_api_key', table_cell_style)],
    [Paragraph('PAYTECH_SECRET_KEY', table_cell_style), Paragraph('Clé secrète PayTech', table_cell_style), Paragraph('your_secret', table_cell_style)],
]

env_table = Table(env_data, colWidths=[4*cm, 5*cm, 4*cm])
env_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('TOPPADDING', (0, 0), (-1, -1), 8),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
]))
story.append(Spacer(1, 12))
story.append(env_table)
story.append(Spacer(1, 6))
story.append(Paragraph('<i>Tableau 3: Variables d\'environnement requises</i>', ParagraphStyle(
    name='Caption',
    fontName='Times New Roman',
    fontSize=10,
    alignment=TA_CENTER,
    textColor=colors.grey
)))
story.append(Spacer(1, 18))

story.append(Paragraph('<b>4.3 Construction et Démarrage</b>', h2_style))
story.append(Paragraph(
    'Une fois les fichiers transférés et les variables configurées, vous pouvez construire l\'image Docker '
    'et démarrer les conteneurs. La première construction peut prendre plusieurs minutes car Docker doit '
    'télécharger les images de base et installer toutes les dépendances. Les constructions ultérieures '
    'seront beaucoup plus rapides grâce au système de cache de Docker.',
    body_style
))

story.append(Paragraph('<b>Commandes de déploiement:</b>', ParagraphStyle(
    name='CodeLabel',
    fontName='Times New Roman',
    fontSize=10,
    spaceBefore=12,
    spaceAfter=4
)))
story.append(Paragraph('docker-compose build --no-cache', code_style))
story.append(Spacer(1, 4))
story.append(Paragraph('docker-compose up -d', code_style))
story.append(Spacer(1, 18))

# Section 5: Configuration SSL
story.append(Paragraph('<b>5. Configuration SSL</b>', h1_style))
story.append(Spacer(1, 12))

story.append(Paragraph('<b>5.1 Installation de Certbot</b>', h2_style))
story.append(Paragraph(
    'Certbot est l\'outil officiel de Let\'s Encrypt pour générer des certificats SSL gratuits. Ces certificats '
    'sont essentiels pour sécuriser les communications entre les utilisateurs et votre serveur, en particulier '
    'pour les pages de connexion et les paiements. Let\'s Encrypt fournit des certificats reconnus par tous '
    'les navigateurs modernes et renouvelables automatiquement.',
    body_style
))

story.append(Paragraph('<b>Installation de Certbot:</b>', ParagraphStyle(
    name='CodeLabel',
    fontName='Times New Roman',
    fontSize=10,
    spaceBefore=12,
    spaceAfter=4
)))
story.append(Paragraph('apt install certbot -y', code_style))
story.append(Spacer(1, 12))

story.append(Paragraph('<b>5.2 Génération du Certificat</b>', h2_style))
story.append(Paragraph(
    'Avant de générer le certificat, assurez-vous que votre domaine pointe correctement vers l\'IP du serveur '
    'et que le port 80 est accessible. La commande Certbot ci-dessous génère un certificat pour le domaine '
    'principal et son sous-domaine www. Vous devrez accepter les conditions d\'utilisation de Let\'s Encrypt '
    'et fournir une adresse email pour les notifications de renouvellement.',
    body_style
))

story.append(Paragraph('<b>Génération du certificat SSL:</b>', ParagraphStyle(
    name='CodeLabel',
    fontName='Times New Roman',
    fontSize=10,
    spaceBefore=12,
    spaceAfter=4
)))
story.append(Paragraph('certbot certonly --standalone -d rrsunureew.sn -d www.rrsunureew.sn', code_style))
story.append(Spacer(1, 12))

story.append(Paragraph('<b>5.3 Copie des Certificats</b>', h2_style))
story.append(Paragraph(
    'Une fois le certificat généré, copiez les fichiers dans le répertoire ssl/ du projet pour que Nginx '
    'puisse les utiliser. Les certificats Let\'s Encrypt sont stockés dans /etc/letsencrypt/live/ sous '
    'forme de liens symboliques pointant vers les fichiers réels dans /etc/letsencrypt/archive/.',
    body_style
))

story.append(Paragraph('<b>Copie des certificats:</b>', ParagraphStyle(
    name='CodeLabel',
    fontName='Times New Roman',
    fontSize=10,
    spaceBefore=12,
    spaceAfter=4
)))
story.append(Paragraph('mkdir -p /opt/rr-sunu-reew/ssl', code_style))
story.append(Spacer(1, 4))
story.append(Paragraph('cp /etc/letsencrypt/live/rrsunureew.sn/fullchain.pem /opt/rr-sunu-reew/ssl/', code_style))
story.append(Spacer(1, 4))
story.append(Paragraph('cp /etc/letsencrypt/live/rrsunureew.sn/privkey.pem /opt/rr-sunu-reew/ssl/', code_style))
story.append(Spacer(1, 12))

story.append(Paragraph('<b>5.4 Renouvellement Automatique</b>', h2_style))
story.append(Paragraph(
    'Les certificats Let\'s Encrypt sont valides 90 jours. Configurez un renouvellement automatique via cron '
    'pour éviter toute interruption de service. La commande certbot renew vérifie si les certificats doivent '
    'être renouvelés et les renouvelle automatiquement si nécessaire, sans interruption de service.',
    body_style
))

story.append(Paragraph('<b>Configuration du renouvellement automatique:</b>', ParagraphStyle(
    name='CodeLabel',
    fontName='Times New Roman',
    fontSize=10,
    spaceBefore=12,
    spaceAfter=4
)))
story.append(Paragraph('crontab -e', code_style))
story.append(Spacer(1, 8))
story.append(Paragraph('# Ajouter cette ligne pour renouvellement quotidien à 3h du matin', code_style))
story.append(Spacer(1, 4))
story.append(Paragraph('0 3 * * * certbot renew --quiet && cp /etc/letsencrypt/live/rrsunureew.sn/*.pem /opt/rr-sunu-reew/ssl/ && docker-compose -f /opt/rr-sunu-reew/docker-compose.yml restart nginx', code_style))
story.append(Spacer(1, 18))

# Section 6: Mise en Production
story.append(Paragraph('<b>6. Mise en Production</b>', h1_style))
story.append(Spacer(1, 12))

story.append(Paragraph('<b>6.1 Vérification des Services</b>', h2_style))
story.append(Paragraph(
    'Avant de mettre l\'application en production, vérifiez que tous les services fonctionnent correctement. '
    'Docker Compose permet de voir l\'état des conteneurs et les logs en cas de problème. Assurez-vous que '
    'les conteneurs web et nginx sont en statut "running" et qu\'aucune erreur n\'apparaît dans les logs.',
    body_style
))

story.append(Paragraph('<b>Vérification de l\'état des conteneurs:</b>', ParagraphStyle(
    name='CodeLabel',
    fontName='Times New Roman',
    fontSize=10,
    spaceBefore=12,
    spaceAfter=4
)))
story.append(Paragraph('docker-compose ps', code_style))
story.append(Spacer(1, 4))
story.append(Paragraph('docker-compose logs -f', code_style))
story.append(Spacer(1, 12))

story.append(Paragraph('<b>6.2 Test de l\'Application</b>', h2_style))
story.append(Paragraph(
    'Testez l\'accès à l\'application via votre navigateur en utilisant l\'URL configurée (https://rrsunureew.sn). '
    'Vérifiez que la page d\'accueil s\'affiche correctement, que le formulaire d\'inscription fonctionne, '
    'et que l\'interface d\'administration est accessible. Testez également les fonctionnalités de paiement '
    'en mode test avec PayTech avant d\'accepter de vraies transactions.',
    body_style
))

story.append(Paragraph('<b>6.3 Initialisation des Données</b>', h2_style))
story.append(Paragraph(
    'L\'application crée automatiquement la base de données au premier démarrage. Vous pouvez initialiser '
    'les données de démonstration en appelant l\'endpoint /api/seed. Cet endpoint crée un utilisateur admin '
    'par défaut et quelques données de test pour vérifier le bon fonctionnement de l\'application.',
    body_style
))

story.append(Paragraph('<b>Initialisation des données:</b>', ParagraphStyle(
    name='CodeLabel',
    fontName='Times New Roman',
    fontSize=10,
    spaceBefore=12,
    spaceAfter=4
)))
story.append(Paragraph('curl https://rrsunureew.sn/api/seed', code_style))
story.append(Spacer(1, 18))

# Section 7: Maintenance
story.append(Paragraph('<b>7. Maintenance</b>', h1_style))
story.append(Spacer(1, 12))

story.append(Paragraph('<b>7.1 Mises à Jour</b>', h2_style))
story.append(Paragraph(
    'Pour mettre à jour l\'application avec une nouvelle version du code, tirez les dernières modifications '
    'depuis le dépôt Git ou transférez les nouveaux fichiers via SCP. Reconstruisez ensuite l\'image Docker '
    'et redémarrez les conteneurs. Cette opération ne prend que quelques minutes et ne cause généralement '
    'pas d\'interruption de service perceptible pour les utilisateurs.',
    body_style
))

story.append(Paragraph('<b>Procédure de mise à jour:</b>', ParagraphStyle(
    name='CodeLabel',
    fontName='Times New Roman',
    fontSize=10,
    spaceBefore=12,
    spaceAfter=4
)))
story.append(Paragraph('cd /opt/rr-sunu-reew', code_style))
story.append(Spacer(1, 4))
story.append(Paragraph('git pull  # ou transfert SCP des nouveaux fichiers', code_style))
story.append(Spacer(1, 4))
story.append(Paragraph('docker-compose build', code_style))
story.append(Spacer(1, 4))
story.append(Paragraph('docker-compose up -d', code_style))
story.append(Spacer(1, 12))

story.append(Paragraph('<b>7.2 Sauvegardes</b>', h2_style))
story.append(Paragraph(
    'La base de données SQLite est stockée dans le répertoire data/db/. Sauvegardez régulièrement ce dossier '
    'sur un emplacement externe pour prévenir toute perte de données en cas de problème serveur. Vous pouvez '
    'automatiser les sauvegardes avec un script cron qui copie le fichier de base de données vers un stockage '
    'distant ou un service de sauvegarde cloud.',
    body_style
))

story.append(Paragraph('<b>Script de sauvegarde automatique:</b>', ParagraphStyle(
    name='CodeLabel',
    fontName='Times New Roman',
    fontSize=10,
    spaceBefore=12,
    spaceAfter=4
)))
story.append(Paragraph('#!/bin/bash', code_style))
story.append(Spacer(1, 4))
story.append(Paragraph('BACKUP_DIR="/backup/rr-sunu-reew"', code_style))
story.append(Spacer(1, 4))
story.append(Paragraph('DATE=$(date +%Y%m%d_%H%M%S)', code_style))
story.append(Spacer(1, 4))
story.append(Paragraph('mkdir -p $BACKUP_DIR', code_style))
story.append(Spacer(1, 4))
story.append(Paragraph('cp /opt/rr-sunu-reew/data/db/*.db $BACKUP_DIR/db_$DATE.db', code_style))
story.append(Spacer(1, 4))
story.append(Paragraph('# Garder seulement les 30 derniers backups', code_style))
story.append(Spacer(1, 4))
story.append(Paragraph('find $BACKUP_DIR -name "db_*.db" -mtime +30 -delete', code_style))
story.append(Spacer(1, 18))

# Section 8: Dépannage
story.append(Paragraph('<b>8. Dépannage</b>', h1_style))
story.append(Spacer(1, 12))

story.append(Paragraph('<b>8.1 Problèmes Courants</b>', h2_style))

problems_data = [
    [Paragraph('<b>Problème</b>', table_header_style), Paragraph('<b>Solution</b>', table_header_style)],
    [Paragraph('Container ne démarre pas', table_cell_style), Paragraph('Vérifiez les logs: docker-compose logs web', table_cell_style)],
    [Paragraph('Erreur 502 Bad Gateway', table_cell_style), Paragraph('L\'app n\'est pas prête, attendez 30s', table_cell_style)],
    [Paragraph('SSL non reconnu', table_cell_style), Paragraph('Vérifiez les fichiers dans ssl/', table_cell_style)],
    [Paragraph('Paiements échouent', table_cell_style), Paragraph('Vérifiez les clés PayTech dans .env', table_cell_style)],
]

problems_table = Table(problems_data, colWidths=[5*cm, 8*cm])
problems_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('TOPPADDING', (0, 0), (-1, -1), 8),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
]))
story.append(Spacer(1, 12))
story.append(problems_table)
story.append(Spacer(1, 6))
story.append(Paragraph('<i>Tableau 4: Problèmes courants et solutions</i>', ParagraphStyle(
    name='Caption',
    fontName='Times New Roman',
    fontSize=10,
    alignment=TA_CENTER,
    textColor=colors.grey
)))
story.append(Spacer(1, 18))

story.append(Paragraph('<b>8.2 Commandes Utiles</b>', h2_style))

cmds_data = [
    [Paragraph('<b>Action</b>', table_header_style), Paragraph('<b>Commande</b>', table_header_style)],
    [Paragraph('Voir les logs', table_cell_style), Paragraph('docker-compose logs -f', table_cell_style)],
    [Paragraph('Redémarrer', table_cell_style), Paragraph('docker-compose restart', table_cell_style)],
    [Paragraph('Arrêter', table_cell_style), Paragraph('docker-compose down', table_cell_style)],
    [Paragraph('Nettoyer', table_cell_style), Paragraph('docker system prune -a', table_cell_style)],
]

cmds_table = Table(cmds_data, colWidths=[4*cm, 8*cm])
cmds_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('TOPPADDING', (0, 0), (-1, -1), 8),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
]))
story.append(Spacer(1, 12))
story.append(cmds_table)
story.append(Spacer(1, 6))
story.append(Paragraph('<i>Tableau 5: Commandes Docker utiles</i>', ParagraphStyle(
    name='Caption',
    fontName='Times New Roman',
    fontSize=10,
    alignment=TA_CENTER,
    textColor=colors.grey
)))

# Build PDF
doc.build(story)
print(f"PDF généré: {output_path}")
