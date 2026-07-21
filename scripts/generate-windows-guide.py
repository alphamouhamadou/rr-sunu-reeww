from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# Register fonts
pdfmetrics.registerFont(TTFont('Times New Roman', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))
registerFontFamily('Times New Roman', normal='Times New Roman', bold='Times New Roman')

# Create PDF
output_path = '/home/z/my-project/download/Guide-Deploiement-Windows-OVH.pdf'
doc = SimpleDocTemplate(
    output_path,
    pagesize=A4,
    leftMargin=2*cm,
    rightMargin=2*cm,
    topMargin=2*cm,
    bottomMargin=2*cm,
    title='Guide de Déploiement Windows vers OVH',
    author='Z.ai',
    creator='Z.ai',
    subject='Guide de déploiement depuis Windows vers serveur OVH pour Renaissance Républicaine Sunu Reew'
)

# Styles
title_style = ParagraphStyle(
    name='CoverTitle',
    fontName='Times New Roman',
    fontSize=28,
    leading=36,
    alignment=TA_CENTER,
    spaceAfter=20
)

subtitle_style = ParagraphStyle(
    name='CoverSubtitle',
    fontName='Times New Roman',
    fontSize=16,
    leading=22,
    alignment=TA_CENTER,
    spaceAfter=30
)

h1_style = ParagraphStyle(
    name='Heading1',
    fontName='Times New Roman',
    fontSize=18,
    leading=24,
    alignment=TA_LEFT,
    spaceBefore=20,
    spaceAfter=10,
    textColor=colors.HexColor('#1F4E79')
)

h2_style = ParagraphStyle(
    name='Heading2',
    fontName='Times New Roman',
    fontSize=14,
    leading=20,
    alignment=TA_LEFT,
    spaceBefore=14,
    spaceAfter=8,
    textColor=colors.HexColor('#2E75B6')
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

caption_style = ParagraphStyle(
    name='Caption',
    fontName='Times New Roman',
    fontSize=10,
    alignment=TA_CENTER,
    textColor=colors.grey
)

story = []

# Cover
story.append(Spacer(1, 80))
story.append(Paragraph('<b>Guide de Déploiement</b>', title_style))
story.append(Paragraph('<b>Windows vers OVH</b>', title_style))
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
story.append(Paragraph('Janvier 2025', ParagraphStyle(
    name='CoverDate',
    fontName='Times New Roman',
    fontSize=12,
    alignment=TA_CENTER
)))
story.append(PageBreak())

# Section 1
story.append(Paragraph('<b>1. Outils à installer sur Windows</b>', h1_style))
story.append(Spacer(1, 10))

story.append(Paragraph(
    'Avant de commencer le déploiement, vous devez installer quelques outils essentiels sur votre ordinateur Windows. '
    'Ces outils vous permettront de vous connecter au serveur OVH, de transférer les fichiers et de gérer le déploiement. '
    'Tous ces logiciels sont gratuits et faciles à installer.',
    body_style
))

story.append(Paragraph('<b>1.1 WinSCP - Transfert de fichiers</b>', h2_style))
story.append(Paragraph(
    'WinSCP est un client SFTP gratuit pour Windows qui permet de transférer des fichiers vers votre serveur OVH '
    'en utilisant une interface graphique intuitive. Il offre une vue côte à côte de vos fichiers locaux et '
    'du serveur distant, avec un simple glisser-déposer pour les transferts. Téléchargez-le depuis winscp.net.',
    body_style
))

story.append(Paragraph('<b>1.2 PuTTY - Connexion SSH</b>', h2_style))
story.append(Paragraph(
    'PuTTY est un client SSH gratuit qui permet d\'ouvrir un terminal sur votre serveur OVH depuis Windows. '
    'Vous pourrez ainsi exécuter des commandes à distance pour installer les logiciels et configurer le serveur. '
    'Téléchargez-le depuis putty.org. Windows 10 et 11 intègrent également un client SSH natif utilisable '
    'directement depuis PowerShell ou l\'invite de commandes.',
    body_style
))

# Tools table
tools_data = [
    [Paragraph('<b>Outil</b>', table_header_style), Paragraph('<b>Usage</b>', table_header_style), Paragraph('<b>Téléchargement</b>', table_header_style)],
    [Paragraph('WinSCP', table_cell_style), Paragraph('Transfert de fichiers', table_cell_style), Paragraph('winscp.net', table_cell_style)],
    [Paragraph('PuTTY', table_cell_style), Paragraph('Connexion SSH', table_cell_style), Paragraph('putty.org', table_cell_style)],
    [Paragraph('PowerShell', table_cell_style), Paragraph('SSH intégré (Win10+)', table_cell_style), Paragraph('Déjà installé', table_cell_style)],
]

tools_table = Table(tools_data, colWidths=[3.5*cm, 4.5*cm, 4.5*cm])
tools_table.setStyle(TableStyle([
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
story.append(tools_table)
story.append(Spacer(1, 6))
story.append(Paragraph('<i>Tableau 1: Outils nécessaires sous Windows</i>', caption_style))
story.append(Spacer(1, 18))

# Section 2
story.append(Paragraph('<b>2. Connexion au serveur OVH</b>', h1_style))
story.append(Spacer(1, 10))

story.append(Paragraph('<b>2.1 Avec PowerShell (Méthode recommandée)</b>', h2_style))
story.append(Paragraph(
    'Windows 10 et 11 incluent un client SSH natif. Ouvrez PowerShell ou l\'invite de commandes et tapez '
    'la commande suivante en remplaçant VOTRE_IP_OVH par l\'adresse IP de votre serveur. Vous devrez ensuite '
    'entrer le mot de passe root fourni par OVH lors de la création du VPS.',
    body_style
))

story.append(Paragraph('<b>Commande de connexion:</b>', ParagraphStyle(
    name='CodeLabel',
    fontName='Times New Roman',
    fontSize=10,
    spaceBefore=10,
    spaceAfter=4
)))
story.append(Paragraph('ssh root@VOTRE_IP_OVH', code_style))
story.append(Spacer(1, 12))

story.append(Paragraph('<b>2.2 Avec PuTTY</b>', h2_style))
story.append(Paragraph(
    'Si vous utilisez PuTTY, ouvrez l\'application et saisissez l\'adresse IP de votre serveur dans le champ '
    '"Host Name". Laissez le port par défaut à 22 et cliquez sur "Open". Une fenêtre de terminal s\'ouvrira '
    'vous demandant votre identifiant (root) et votre mot de passe. La première connexion affichera un avertissement '
    'de sécurité, cliquez sur "Oui" pour continuer.',
    body_style
))

# Section 3
story.append(Paragraph('<b>3. Préparation du serveur OVH</b>', h1_style))
story.append(Spacer(1, 10))

story.append(Paragraph(
    'Une fois connecté à votre serveur OVH, vous devez installer Docker et préparer l\'environnement. '
    'Exécutez les commandes suivantes une par une. Chaque commande peut prendre quelques secondes à s\'exécuter.',
    body_style
))

story.append(Paragraph('<b>3.1 Mise à jour du système</b>', h2_style))
story.append(Paragraph(
    'La première étape consiste à mettre à jour la liste des paquets disponibles et à installer les dernières '
    'mises à jour de sécurité. Cette opération garantit que votre serveur dispose des dernières corrections '
    'de sécurité et des versions les plus récentes des logiciels de base.',
    body_style
))

story.append(Paragraph('apt update && apt upgrade -y', code_style))
story.append(Spacer(1, 12))

story.append(Paragraph('<b>3.2 Installation de Docker</b>', h2_style))
story.append(Paragraph(
    'Docker est la plateforme de containerisation qui permettra d\'exécuter l\'application dans un environnement '
    'isolé. Le script officiel de Docker installe automatiquement la dernière version stable ainsi que Docker Compose.',
    body_style
))

story.append(Paragraph('curl -fsSL https://get.docker.com | sh', code_style))
story.append(Spacer(1, 12))

story.append(Paragraph('<b>3.3 Création du dossier du projet</b>', h2_style))
story.append(Paragraph('mkdir -p /opt/rr-sunu-reew', code_style))
story.append(Spacer(1, 18))

# Section 4
story.append(Paragraph('<b>4. Transfert des fichiers avec WinSCP</b>', h1_style))
story.append(Spacer(1, 10))

story.append(Paragraph('<b>4.1 Connexion WinSCP</b>', h2_style))
story.append(Paragraph(
    'Lancez WinSCP et créez une nouvelle session. Sélectionnez le protocole SFTP, puis entrez l\'adresse IP '
    'de votre serveur OVH dans le champ "Nom d\'hôte". Le port doit être 22, l\'utilisateur "root", et votre '
    'mot de passe dans le champ correspondant. Cliquez sur "Connexion" pour accéder au serveur.',
    body_style
))

story.append(Paragraph('<b>4.2 Navigation et transfert</b>', h2_style))
story.append(Paragraph(
    'Une fois connecté, vous verrez deux panneaux. Le panneau gauche affiche vos fichiers Windows, le panneau '
    'droit affiche les fichiers du serveur. Naviguez vers /opt/rr-sunu-reew sur le serveur (panneau droit). '
    'Sélectionnez tous les fichiers du projet sur votre Windows (panneau gauche) et faites-les glisser vers '
    'le panneau droit. Le transfert démarrera automatiquement.',
    body_style
))

# Files to transfer
files_data = [
    [Paragraph('<b>Fichier/Dossier</b>', table_header_style), Paragraph('<b>Description</b>', table_header_style)],
    [Paragraph('src/', table_cell_style), Paragraph('Code source de l\'application', table_cell_style)],
    [Paragraph('public/', table_cell_style), Paragraph('Fichiers statiques (images, icons)', table_cell_style)],
    [Paragraph('prisma/', table_cell_style), Paragraph('Schéma de base de données', table_cell_style)],
    [Paragraph('Dockerfile', table_cell_style), Paragraph('Configuration Docker', table_cell_style)],
    [Paragraph('docker-compose.yml', table_cell_style), Paragraph('Orchestration des conteneurs', table_cell_style)],
    [Paragraph('nginx.conf', table_cell_style), Paragraph('Configuration Nginx', table_cell_style)],
    [Paragraph('.env.example', table_cell_style), Paragraph('Template des variables d\'environnement', table_cell_style)],
    [Paragraph('package.json', table_cell_style), Paragraph('Dépendances du projet', table_cell_style)],
]

files_table = Table(files_data, colWidths=[4*cm, 9*cm])
files_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
story.append(Spacer(1, 12))
story.append(files_table)
story.append(Spacer(1, 6))
story.append(Paragraph('<i>Tableau 2: Fichiers à transférer vers le serveur</i>', caption_style))
story.append(Spacer(1, 18))

# Section 5
story.append(Paragraph('<b>5. Configuration et lancement</b>', h1_style))
story.append(Spacer(1, 10))

story.append(Paragraph('<b>5.1 Création du fichier .env</b>', h2_style))
story.append(Paragraph(
    'Retournez dans votre terminal SSH (PuTTY ou PowerShell) et exécutez les commandes suivantes pour créer '
    'le fichier de configuration avec vos paramètres spécifiques.',
    body_style
))

story.append(Paragraph('cd /opt/rr-sunu-reew', code_style))
story.append(Paragraph('cp .env.example .env', code_style))
story.append(Paragraph('nano .env', code_style))
story.append(Spacer(1, 12))

story.append(Paragraph('<b>5.2 Variables à configurer</b>', h2_style))
story.append(Paragraph(
    'Dans l\'éditeur nano, modifiez les valeurs suivantes. Utilisez les touches fléchées pour naviguer, '
    'modifiez les valeurs, puis appuyez sur Ctrl+O et Entrée pour sauvegarder, et Ctrl+X pour quitter.',
    body_style
))

env_data = [
    [Paragraph('<b>Variable</b>', table_header_style), Paragraph('<b>Valeur exemple</b>', table_header_style)],
    [Paragraph('NEXT_PUBLIC_APP_URL', table_cell_style), Paragraph('https://rrsunureew.sn', table_cell_style)],
    [Paragraph('PAYTECH_API_KEY', table_cell_style), Paragraph('votre_cle_api', table_cell_style)],
    [Paragraph('PAYTECH_SECRET_KEY', table_cell_style), Paragraph('votre_cle_secrete', table_cell_style)],
]

env_table = Table(env_data, colWidths=[5*cm, 8*cm])
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
story.append(Paragraph('<i>Tableau 3: Variables d\'environnement à configurer</i>', caption_style))
story.append(Spacer(1, 12))

story.append(Paragraph('<b>5.3 Lancement de l\'application</b>', h2_style))
story.append(Paragraph('mkdir -p data/db', code_style))
story.append(Paragraph('docker-compose up -d --build', code_style))
story.append(Spacer(1, 8))
story.append(Paragraph(
    'La première construction peut prendre 5 à 10 minutes. Patientez jusqu\'à ce que le message '
    '"Creating rr-sunu-reew" apparaisse. Vous pouvez vérifier l\'état avec la commande suivante:',
    body_style
))
story.append(Paragraph('docker-compose ps', code_style))
story.append(Spacer(1, 18))

# Section 6
story.append(Paragraph('<b>6. Configuration SSL (HTTPS)</b>', h1_style))
story.append(Spacer(1, 10))

story.append(Paragraph(
    'Pour sécuriser votre site avec HTTPS, vous devez obtenir un certificat SSL gratuit de Let\'s Encrypt. '
    'Cette étape nécessite que votre domaine pointe vers l\'IP de votre serveur.',
    body_style
))

story.append(Paragraph('<b>6.1 Installation de Certbot</b>', h2_style))
story.append(Paragraph('apt install certbot -y', code_style))
story.append(Spacer(1, 12))

story.append(Paragraph('<b>6.2 Génération du certificat</b>', h2_style))
story.append(Paragraph('docker-compose stop nginx', code_style))
story.append(Paragraph('certbot certonly --standalone -d rrsunureew.sn -d www.rrsunureew.sn', code_style))
story.append(Spacer(1, 12))

story.append(Paragraph('<b>6.3 Copie des certificats</b>', h2_style))
story.append(Paragraph('mkdir -p ssl', code_style))
story.append(Paragraph('cp /etc/letsencrypt/live/rrsunureew.sn/fullchain.pem ssl/', code_style))
story.append(Paragraph('cp /etc/letsencrypt/live/rrsunureew.sn/privkey.pem ssl/', code_style))
story.append(Paragraph('docker-compose up -d', code_style))
story.append(Spacer(1, 18))

# Section 7
story.append(Paragraph('<b>7. Commandes utiles</b>', h1_style))
story.append(Spacer(1, 10))

cmds_data = [
    [Paragraph('<b>Action</b>', table_header_style), Paragraph('<b>Commande</b>', table_header_style)],
    [Paragraph('Voir les logs', table_cell_style), Paragraph('docker-compose logs -f', table_cell_style)],
    [Paragraph('Redémarrer', table_cell_style), Paragraph('docker-compose restart', table_cell_style)],
    [Paragraph('Arrêter', table_cell_style), Paragraph('docker-compose down', table_cell_style)],
    [Paragraph('État des conteneurs', table_cell_style), Paragraph('docker-compose ps', table_cell_style)],
    [Paragraph('Mettre à jour', table_cell_style), Paragraph('docker-compose up -d --build', table_cell_style)],
]

cmds_table = Table(cmds_data, colWidths=[4*cm, 9*cm])
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
story.append(cmds_table)
story.append(Spacer(1, 6))
story.append(Paragraph('<i>Tableau 4: Commandes Docker de maintenance</i>', caption_style))

# Build
doc.build(story)
print(f"PDF généré: {output_path}")
