import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { senegalData } from '@/lib/senegal-data'

// Reset and reseed database - ADMIN ONLY in production
export async function GET() {
  try {
    // Delete all existing data in reverse order of dependencies
    console.log('Deleting existing data...')
    
    await db.notification.deleteMany({})
    await db.message.deleteMany({})
    await db.contribution.deleteMany({})
    await db.donation.deleteMany({})
    await db.article.deleteMany({})
    await db.event.deleteMany({})
    await db.member.deleteMany({})
    await db.commune.deleteMany({})
    await db.department.deleteMany({})
    await db.region.deleteMany({})
    
    console.log('Creating new data...')
    
    // Create regions, departments, and communes
    for (const regionData of senegalData.regions) {
      const region = await db.region.create({
        data: { name: regionData.name }
      })

      for (const deptData of regionData.departments) {
        const department = await db.department.create({
          data: {
            name: deptData.name,
            regionId: region.id
          }
        })

        for (const communeName of deptData.communes) {
          await db.commune.create({
            data: {
              name: communeName,
              departmentId: department.id
            }
          })
        }
      }
    }

    // Count created
    const regions = await db.region.count()
    const departments = await db.department.count()
    const communes = await db.commune.count()

    // Create admin user
    const adminPassword = Buffer.from('admin123').toString('base64')
    await db.member.create({
      data: {
        email: 'admin@rrsunureew.sn',
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'Principal',
        dateOfBirth: '1980-01-01',
        placeOfBirth: 'Dakar',
        address: 'Dakar, Sénégal',
        phone: '+221 77 000 00 00',
        role: 'admin',
        status: 'approved',
        membershipNumber: 'RR-000001',
        membershipDate: new Date('2024-01-01'),
      }
    })

    // Create sample members
    const memberPassword = Buffer.from('member123').toString('base64')
    const sampleMembers = [
      {
        email: 'amadou.diop@exemple.sn',
        password: memberPassword,
        firstName: 'Amadou',
        lastName: 'Diop',
        dateOfBirth: '1985-03-15',
        placeOfBirth: 'Dakar',
        address: 'Médina, Dakar',
        phone: '+221 77 123 45 67',
        cniNumber: '1234567890123',
        role: 'member',
        status: 'approved',
        membershipNumber: 'RR-000002',
        membershipDate: new Date('2024-02-15'),
      },
      {
        email: 'fatou.sow@exemple.sn',
        password: memberPassword,
        firstName: 'Fatou',
        lastName: 'Sow',
        dateOfBirth: '1990-07-22',
        placeOfBirth: 'Thiès',
        address: 'Thiès, Sénégal',
        phone: '+221 78 234 56 78',
        cniNumber: '2345678901234',
        role: 'member',
        status: 'approved',
        membershipNumber: 'RR-000003',
        membershipDate: new Date('2024-03-01'),
      },
      {
        email: 'ousmane.ba@exemple.sn',
        password: memberPassword,
        firstName: 'Ousmane',
        lastName: 'Ba',
        dateOfBirth: '1978-11-10',
        placeOfBirth: 'Saint-Louis',
        address: 'Saint-Louis, Sénégal',
        phone: '+221 76 345 67 89',
        cniNumber: '3456789012345',
        role: 'member',
        status: 'pending',
      },
      {
        email: 'aissatou.ndiaye@exemple.sn',
        password: memberPassword,
        firstName: 'Aissatou',
        lastName: 'Ndiaye',
        dateOfBirth: '1992-05-30',
        placeOfBirth: 'Kaolack',
        address: 'Kaolack, Sénégal',
        phone: '+221 70 456 78 90',
        cniNumber: '4567890123456',
        role: 'member',
        status: 'approved',
        membershipNumber: 'RR-000004',
        membershipDate: new Date('2024-01-20'),
      },
      {
        email: 'ibrahima.fall@exemple.sn',
        password: memberPassword,
        firstName: 'Ibrahima',
        lastName: 'Fall',
        dateOfBirth: '1982-09-05',
        placeOfBirth: 'Ziguinchor',
        address: 'Ziguinchor, Sénégal',
        phone: '+221 77 567 89 01',
        cniNumber: '5678901234567',
        role: 'member',
        status: 'approved',
        membershipNumber: 'RR-000005',
        membershipDate: new Date('2024-02-28'),
      },
    ]

    for (const member of sampleMembers) {
      await db.member.create({ data: member })
    }

    // Create sample articles
    const articles = [
      {
        title: 'Grand meeting de lancement du programme 2024',
        slug: 'grand-meeting-lancement-programme-2024',
        content: `Le Secrétaire Général Abdoulaye Diouf Sarr a officiellement lancé le programme électoral 2024 lors d'un grand meeting tenu à Dakar. Devant des milliers de militants venus des quatre coins du pays, le SG a présenté les grandes lignes du projet de société de Renaissance Républicaine Sunu Reew.

Les axes prioritaires incluent:
- L'emploi des jeunes à travers des programmes de formation professionnelle
- L'amélioration du système de santé avec la construction de nouveaux centres hospitaliers
- La modernisation de l'agriculture pour garantir la souveraineté alimentaire
- Le développement des infrastructures dans toutes les régions`,
        excerpt: 'Le Secrétaire Général Abdoulaye Diouf Sarr lance le programme électoral 2024 devant des milliers de militants.',
        category: 'actualite',
        isFeatured: true,
      },
      {
        title: 'Communiqué: Renaissance Républicaine Sunu Reew condamne les violences',
        slug: 'communique-condamnation-violences',
        content: `Le Bureau Exécutif de Renaissance Républicaine Sunu Reew suit avec préoccupation les récents événements survenus dans notre pays.

Dans un communiqué rendu public ce jour, le parti appelle au calme et au dialogue.`,
        excerpt: 'Le parti appelle au calme et au dialogue face aux récentes tensions.',
        category: 'communique',
        isFeatured: false,
      },
      {
        title: 'Visite de terrain dans la région de Fatick',
        slug: 'visite-terrain-region-fatick',
        content: `Dans le cadre de sa tournée nationale, le Secrétaire Général Abdoulaye Diouf Sarr s'est rendu dans la région de Fatick pour rencontrer les populations locales.`,
        excerpt: 'Le SG en tournée à Fatick pour rencontrer les populations locales.',
        category: 'evenement',
        isFeatured: true,
      },
    ]

    for (const article of articles) {
      await db.article.create({ data: article })
    }

    // Create sample donations
    const donations = [
      {
        donorName: 'Mamadou Diallo',
        donorEmail: 'mamadou.diallo@exemple.sn',
        donorPhone: '+221 77 111 22 33',
        amount: 50000,
        paymentMethod: 'wave',
        status: 'completed',
        paymentRef: 'WV-' + Date.now(),
      },
      {
        donorName: 'Mariama Sy',
        donorEmail: 'mariama.sy@exemple.sn',
        donorPhone: '+221 78 222 33 44',
        amount: 25000,
        paymentMethod: 'orange_money',
        status: 'completed',
        paymentRef: 'OM-' + Date.now(),
      },
    ]

    for (const donation of donations) {
      await db.donation.create({ data: donation })
    }

    // Create sample events
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)

    const events = [
      {
        title: 'Grand Meeting de Dakar',
        description: 'Grand meeting public avec le Secrétaire Général Abdoulaye Diouf Sarr. Venez nombreux!',
        date: tomorrow,
        location: "Place de l'Indépendance, Dakar",
      },
      {
        title: 'Réunion de Coordination Régionale',
        description: 'Réunion avec les responsables régionaux et départementaux.',
        date: nextWeek,
        location: 'Thiès, Sénégal',
      },
      {
        title: 'Forum des Jeunes',
        description: "Forum dédié à l'engagement des jeunes dans la vie politique.",
        date: nextMonth,
        location: 'Centre des Congrès, Dakar',
      },
    ]

    for (const event of events) {
      await db.event.create({ data: event })
    }

    // Create welcome notifications
    const allMembers = await db.member.findMany()
    for (const member of allMembers) {
      await db.notification.create({
        data: {
          memberId: member.id,
          title: 'Bienvenue sur la plateforme',
          message: 'Bienvenue sur la plateforme de Renaissance Républicaine Sunu Reew!',
          type: 'info',
        }
      })
    }

    return NextResponse.json({ 
      message: 'Database reset and reseeded successfully!',
      stats: {
        regions,
        departments,
        communes,
        members: allMembers.length,
        articles: articles.length,
        events: events.length,
      }
    })
  } catch (error) {
    console.error('Reset error:', error)
    return NextResponse.json({ error: 'Failed to reset database' }, { status: 500 })
  }
}
