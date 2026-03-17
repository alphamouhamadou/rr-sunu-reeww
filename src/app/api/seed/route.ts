import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/password'

// Données des régions du Sénégal
const regionsData = [
  {
    name: 'Dakar',
    departments: [
      { name: 'Dakar', communes: ['Dakar Plateau', 'Médina', 'Fann Point E', 'Guele Tapée', 'Hann Bel Air', 'Sicap Liberté', 'Grand Dakar', 'Biscuiterie', 'Dieuppeul Derklé'] },
      { name: 'Guédiawaye', communes: ['Guediawaye', 'Ndiarème Limamoulaye', 'Sam Notaire', 'Wakhinane Nimzatt'] },
      { name: 'Pikine', communes: ['Pikine Est', 'Pikine Ouest', 'Diamaguène Sicap Mbao', 'Thiaroye Azur', 'Thiaroye Sur Mer', 'Diamniadio', 'Keur Massar'] },
      { name: 'Rufisque', communes: ['Rufisque Est', 'Rufisque Nord', 'Rufisque Ouest', 'Bargny', 'Diamniadio', 'Sébikhotane', 'Jaxaay'] },
    ]
  },
  {
    name: 'Thiès',
    departments: [
      { name: 'Thiès', communes: ['Thiès Nord', 'Thiès Sud', 'Thiès Est', 'Thiès Ouest', 'Fandène', 'Ngoundiane', 'Notto Gouye Diama'] },
      { name: 'Mbour', communes: ['Mbour', 'Saly Portudal', 'Somone', 'Ngaparou', 'Nianing', 'Warang', 'Malicounda'] },
      { name: 'Tivaouane', communes: ['Tivaouane', 'Méouane', 'Mérina Dakhar', 'Niakhène', 'Pambal', 'Thilmakha'] },
      { name: 'Fissel', communes: ['Fissel', 'Ndiaganiao', 'Sessène'] },
    ]
  },
  {
    name: 'Saint-Louis',
    departments: [
      { name: 'Saint-Louis', communes: ['Saint-Louis', 'Ndiol', 'Gandon'] },
      { name: 'Dagana', communes: ['Dagana', 'Richard Toll', 'Ross Béthio', 'Bokhol'] },
      { name: 'Podor', communes: ['Podor', 'Guede', 'Walaldé', 'Dodel', 'Gamadji Saré', 'Bodé Lao', 'Ndioum', 'Salde'] },
    ]
  },
  {
    name: 'Louga',
    departments: [
      { name: 'Louga', communes: ['Louga', 'Potou', 'Ndande', 'Nguer Malal'] },
      { name: 'Kébémer', communes: ['Kébémer', 'Thiel', 'Lompoul', 'Darou Khoudoss'] },
      { name: 'Linguère', communes: ['Linguère', 'Dahra', 'Barkédji', 'Sagatta Dioloff'] },
    ]
  },
  {
    name: 'Matam',
    departments: [
      { name: 'Matam', communes: ['Matam', 'Nguidjilone', 'Ogo', 'Thilogne'] },
      { name: 'Kanel', communes: ['Kanel', 'Orkadiere', 'Wouro Sidy', 'Sinthiou Bamambé-Banadji'] },
      { name: 'Ranérou', communes: ['Ranérou', 'Vélingara', 'Yang Yang'] },
    ]
  },
  {
    name: 'Tambacounda',
    departments: [
      { name: 'Tambacounda', communes: ['Tambacounda', 'Kouthiaba Wolof', 'Missirah', 'Dialacoto', 'Mbaké'] },
      { name: 'Goudiry', communes: ['Goudiry', 'Bala', 'Boynguel Bamba', 'Dianké Makha', 'Koulor'] },
      { name: 'Bakel', communes: ['Bakel', 'Moudou Bary', 'Diawara', 'Kénieba', 'Gathiary'] },
    ]
  },
  {
    name: 'Kaolack',
    departments: [
      { name: 'Kaolack', communes: ['Kaolack', 'Guinguinéo', 'Ndiob', 'Sibassor'] },
      { name: 'Nioro', communes: ['Nioro', 'Wack Ngouna', 'Medina Sabakh', 'Djibanar'] },
      { name: 'Guinguinéo', communes: ['Guinguinéo', 'Fissel'] },
    ]
  },
  {
    name: 'Diourbel',
    departments: [
      { name: 'Diourbel', communes: ['Diourbel', 'Ndindy', 'Ndoulo'] },
      { name: 'Mbacké', communes: ['Mbacké', 'Dahra', 'Kael', 'Nguélou'] },
      { name: 'Bambey', communes: ['Bambey', 'Baba Garage', 'Lambaye', 'Ngogom'] },
    ]
  },
  {
    name: 'Fatick',
    departments: [
      { name: 'Fatick', communes: ['Fatick', 'Djilasse', 'Diakhao', 'Niakhar', 'Tattaguine'] },
      { name: 'Foundiougne', communes: ['Foundiougne', 'Djirnda', 'Karang', 'Passy', 'Sokone', 'Toubacouta', 'Niodior'] },
      { name: 'Gossas', communes: ['Gossas', 'Colobane', 'Mbadakhoune'] },
    ]
  },
  {
    name: 'Ziguinchor',
    departments: [
      { name: 'Ziguinchor', communes: ['Ziguinchor', 'Agnack', 'Bourote', 'Enampore', 'Boutoupa', 'Oukout'] },
      { name: 'Bignona', communes: ['Bignona', 'Thionck Essyl', 'Tendouck', 'Tenghory', 'Kataba 1', 'Sindian', 'Diouloulou', 'Oulampane'] },
      { name: 'Oussouye', communes: ['Oussouye', 'Loudia Ouoloff', 'Kabrousse', 'Mlomp'] },
    ]
  },
  {
    name: 'Kolda',
    departments: [
      { name: 'Kolda', communes: ['Kolda', 'Dabia', 'Mampatim', 'Saré Bidji'] },
      { name: 'Médina Yoro Foulah', communes: ['Médina Yoro Foulah', 'Ndorna', 'Pata', 'Fafacourou'] },
      { name: 'Vélingara', communes: ['Vélingara', 'Bonconto', 'Pakhoura', 'Diaobé'] },
      { name: 'Saraya', communes: ['Saraya', 'Sabodala', 'Khossanto'] },
    ]
  },
  {
    name: 'Sédhiou',
    departments: [
      { name: 'Sédhiou', communes: ['Sédhiou', 'Djibabouye', 'Djiredji', 'Marsassoum'] },
      { name: 'Bounkiling', communes: ['Bounkiling', 'Boghal', 'Bona', 'Diaroumé'] },
      { name: 'Goudomp', communes: ['Goudomp', 'Simbandi Brassou', 'Sandiniéry'] },
    ]
  },
  {
    name: 'Kédougou',
    departments: [
      { name: 'Kédougou', communes: ['Kédougou', 'Bandafassi', 'Fongolimbi', 'Dakateli', 'Salemata'] },
      { name: 'Salémata', communes: ['Salémata', 'Darbenti', 'Ethouolo'] },
      { name: 'Saraya', communes: ['Saraya', 'Khossanto', 'Sabodala'] },
    ]
  },
  {
    name: 'Kaffrine',
    departments: [
      { name: 'Kaffrine', communes: ['Kaffrine', 'Gniby', 'Méckhé', 'Touba Mbella', 'Nganda'] },
      { name: 'Birkelane', communes: ['Birkelane', 'Mboss', 'Ndiobène'] },
      { name: 'Koungheul', communes: ['Koungheul', 'Ida Mouride', 'Lour Escale', 'Missirah Wadene'] },
      { name: 'Maleme Hodar', communes: ['Maleme Hodar', 'Darou Salam Typ', 'Sagna'] },
    ]
  },
]

export async function GET() {
  try {
    // Check if already seeded
    const existingRegions = await db.region.count()
    if (existingRegions > 0) {
      return NextResponse.json({ message: 'Database already seeded' })
    }

    // Hash passwords
    const adminPassword = await hashPassword('admin123')
    const memberPassword = await hashPassword('member123')

    // Create regions, departments, and communes
    for (const regionData of regionsData) {
      await db.region.create({
        data: {
          name: regionData.name,
          departments: {
            create: regionData.departments.map(dept => ({
              name: dept.name,
              communes: {
                create: dept.communes.map(commune => ({
                  name: commune
                }))
              }
            }))
          }
        }
      })
    }

    // Get Dakar region for admin
    const dakarRegion = await db.region.findFirst({
      where: { name: 'Dakar' },
      include: { departments: { include: { communes: true } } }
    })

    const firstDepartment = dakarRegion?.departments[0]
    const firstCommune = firstDepartment?.communes[0]

    // Create admin user
    const admin = await db.member.create({
      data: {
        email: 'admin@rrsunureew.sn',
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'Principal',
        dateOfBirth: '1980-01-01',
        placeOfBirth: 'Dakar',
        address: 'Dakar, Sénégal',
        phone: '+221 77 000 00 00',
        cniNumber: 'ADMIN-001-SEED',
        photo: null,
        residenceType: 'senegal',
        regionId: dakarRegion?.id || null,
        departmentId: firstDepartment?.id || null,
        communeId: firstCommune?.id || null,
        hasVoterCard: true,
        voterCardNumber: 'VE-001-ADMIN',
        role: 'admin',
        status: 'approved',
        emailVerified: true,
        membershipNumber: 'RR-000001',
        membershipDate: new Date('2024-01-01'),
      }
    })

    // Create a test member
    const member = await db.member.create({
      data: {
        email: 'membre@rrsunureew.sn',
        password: memberPassword,
        firstName: 'Amadou',
        lastName: 'Diop',
        dateOfBirth: '1990-05-15',
        placeOfBirth: 'Thiès',
        address: 'Thiès, Sénégal',
        phone: '+221 78 123 45 67',
        cniNumber: 'MEMBER-001-SEED',
        photo: null,
        residenceType: 'senegal',
        regionId: dakarRegion?.id || null,
        departmentId: firstDepartment?.id || null,
        communeId: firstCommune?.id || null,
        hasVoterCard: true,
        voterCardNumber: 'VE-002-MEMBER',
        role: 'member',
        status: 'approved',
        emailVerified: true,
        membershipNumber: 'RR-000002',
        membershipDate: new Date('2024-02-15'),
      }
    })

    // Create default settings
    await db.setting.createMany({
      data: [
        { key: 'site_name', value: 'Renaissance Républicaine Sunu Reew' },
        { key: 'site_description', value: 'Parti politique sénégalais' },
        { key: 'card_fee', value: '2000' },
        { key: 'monthly_contribution', value: '5000' },
        { key: 'currency', value: 'FCFA' },
      ]
    })

    // Create welcome notifications for admin and member
    await db.notification.createMany({
      data: [
        {
          memberId: admin.id,
          title: 'Bienvenue !',
          message: 'Bienvenue sur la plateforme RR Sunu Reew. Configurez votre espace administration.',
          type: 'info',
        },
        {
          memberId: member.id,
          title: 'Bienvenue !',
          message: 'Bienvenue sur la plateforme RR Sunu Reew. Votre compte a été activé.',
          type: 'info',
        },
      ]
    })

    return NextResponse.json({ 
      message: 'Database seeded successfully',
      stats: {
        regions: regionsData.length,
        departments: regionsData.reduce((acc, r) => acc + r.departments.length, 0),
        communes: regionsData.reduce((acc, r) => acc + r.departments.reduce((a, d) => a + d.communes.length, 0), 0),
        members: 2,
        notifications: 2
      }
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ 
      error: 'Seed failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}