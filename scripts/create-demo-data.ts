import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Création des comptes de démonstration...')
  
  // Create admin user
  const adminPassword = Buffer.from('admin123').toString('base64')
  await prisma.member.create({
    data: {
      email: 'admin@rrsunureew.sn',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'Principal',
      dateOfBirth: '1980-01-01',
      placeOfBirth: 'Dakar',
      address: 'Dakar, Sénégal',
      phone: '+221 77 000 00 00',
      cniNumber: '0000000000001',
      residenceType: 'senegal',
      hasVoterCard: true,
      voterCardNumber: 'VOTER-ADMIN-001',
      role: 'admin',
      status: 'approved',
      membershipNumber: 'RR-000001',
      membershipDate: new Date('2024-01-01'),
    }
  })
  console.log('Admin créé: admin@rrsunureew.sn')

  // Create sample members
  const memberPassword = Buffer.from('member123').toString('base64')
  const sampleMembers = [
    { 
      email: 'amadou.diop@exemple.sn', 
      firstName: 'Amadou', 
      lastName: 'Diop', 
      placeOfBirth: 'Dakar', 
      address: 'Médina, Dakar', 
      phone: '+221 77 123 45 67', 
      cniNumber: '1234567890001',
      residenceType: 'senegal',
      hasVoterCard: true,
      voterCardNumber: 'VOTER-002',
      status: 'approved', 
      membershipNumber: 'RR-000002' 
    },
    { 
      email: 'fatou.sow@exemple.sn', 
      firstName: 'Fatou', 
      lastName: 'Sow', 
      placeOfBirth: 'Thiès', 
      address: 'Thiès, Sénégal', 
      phone: '+221 78 234 56 78', 
      cniNumber: '1234567890002',
      residenceType: 'senegal',
      hasVoterCard: true,
      voterCardNumber: 'VOTER-003',
      status: 'approved', 
      membershipNumber: 'RR-000003' 
    },
    { 
      email: 'ousmane.ba@exemple.sn', 
      firstName: 'Ousmane', 
      lastName: 'Ba', 
      placeOfBirth: 'Saint-Louis', 
      address: 'Saint-Louis, Sénégal', 
      phone: '+221 76 345 67 89', 
      cniNumber: '1234567890003',
      residenceType: 'senegal',
      hasVoterCard: false,
      status: 'pending', 
      membershipNumber: null 
    },
    { 
      email: 'aissatou.ndiaye@exemple.sn', 
      firstName: 'Aissatou', 
      lastName: 'Ndiaye', 
      placeOfBirth: 'Kaolack', 
      address: 'Kaolack, Sénégal', 
      phone: '+221 70 456 78 90', 
      cniNumber: '1234567890004',
      residenceType: 'senegal',
      hasVoterCard: true,
      voterCardNumber: 'VOTER-004',
      status: 'approved', 
      membershipNumber: 'RR-000004' 
    },
    { 
      email: 'ibrahima.fall@exemple.sn', 
      firstName: 'Ibrahima', 
      lastName: 'Fall', 
      placeOfBirth: 'Ziguinchor', 
      address: 'Ziguinchor, Sénégal', 
      phone: '+221 77 567 89 01', 
      cniNumber: '1234567890005',
      residenceType: 'senegal',
      hasVoterCard: true,
      voterCardNumber: 'VOTER-005',
      status: 'approved', 
      membershipNumber: 'RR-000005' 
    },
    // Membre de la diaspora
    { 
      email: 'moussa.diallo@exemple.fr', 
      firstName: 'Moussa', 
      lastName: 'Diallo', 
      placeOfBirth: 'Dakar', 
      address: '123 Rue de Paris, 75001 Paris', 
      phone: '+33 6 12 34 56 78', 
      cniNumber: '1234567890006',
      residenceType: 'diaspora',
      country: 'FR',
      cityAbroad: 'Paris',
      hasVoterCard: true,
      voterCardNumber: 'VOTER-DIASPORA-001',
      status: 'approved', 
      membershipNumber: 'RR-000006' 
    },
  ]

  for (const member of sampleMembers) {
    await prisma.member.create({
      data: {
        email: member.email,
        password: memberPassword,
        firstName: member.firstName,
        lastName: member.lastName,
        dateOfBirth: '1990-01-01',
        placeOfBirth: member.placeOfBirth,
        address: member.address,
        phone: member.phone,
        cniNumber: member.cniNumber,
        residenceType: member.residenceType,
        country: (member as any).country || null,
        cityAbroad: (member as any).cityAbroad || null,
        hasVoterCard: member.hasVoterCard,
        voterCardNumber: member.voterCardNumber,
        role: 'member',
        status: member.status,
        membershipNumber: member.membershipNumber,
        membershipDate: member.membershipNumber ? new Date('2024-02-15') : null,
      }
    })
    console.log('Membre créé: ' + member.email)
  }

  // Create articles
  const articles = [
    { title: 'Grand meeting de lancement du programme 2024', slug: 'grand-meeting-lancement-programme-2024', excerpt: 'Le SG lance le programme 2024', category: 'actualite', isFeatured: true },
    { title: 'Communiqué: Renaissance Républicaine Sunu Reew condamne les violences', slug: 'communique-condamnation-violences', excerpt: 'Appel au calme et au dialogue', category: 'communique', isFeatured: false },
    { title: 'Visite de terrain dans la région de Fatick', slug: 'visite-terrain-region-fatick', excerpt: 'Le SG en tournée à Fatick', category: 'evenement', isFeatured: true },
  ]

  for (const article of articles) {
    await prisma.article.create({
      data: {
        ...article,
        content: article.title + ' - Contenu complet de l\'article...',
      }
    })
    console.log('Article créé: ' + article.title)
  }

  // Create events
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)

  const events = [
    { title: 'Grand Meeting de Dakar', location: 'Place de l\'Indépendance, Dakar', date: tomorrow },
    { title: 'Réunion de Coordination Régionale', location: 'Thiès, Sénégal', date: nextWeek },
  ]

  for (const event of events) {
    await prisma.event.create({
      data: {
        ...event,
        description: event.title + ' - Description de l\'événement',
      }
    })
    console.log('Événement créé: ' + event.title)
  }

  // Create donations
  await prisma.donation.create({
    data: {
      donorName: 'Mamadou Diallo',
      donorEmail: 'mamadou@exemple.sn',
      donorPhone: '+221 77 111 22 33',
      amount: 50000,
      paymentMethod: 'wave',
      status: 'completed',
      paymentRef: 'WV-001',
    }
  })
  console.log('Don créé')

  console.log('\n=== Comptes de démonstration ===')
  console.log('Admin: admin@rrsunureew.sn / admin123')
  console.log('Membre: amadou.diop@exemple.sn / member123')
  console.log('Diaspora: moussa.diallo@exemple.fr / member123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
