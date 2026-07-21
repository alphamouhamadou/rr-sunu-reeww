const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const hash = await bcrypt.hash('admin123', 10)
  
  const admin = await prisma.member.create({
    data: {
      email: 'admin@rrsunureew.sn',
      password: hash,
      firstName: 'Admin',
      lastName: 'Principal',
      dateOfBirth: '1970-01-01',
      placeOfBirth: 'Dakar',
      address: 'Dakar',
      phone: '+221770000000',
      cniNumber: '0000000000',
      role: 'admin',
      status: 'approved',
      membershipNumber: 'RR-000001'
    }
  })
  
  console.log('✅ Admin créé avec succès!')
  console.log('📧 Email: admin@rrsunureew.sn')
  console.log('🔑 Mot de passe: admin123')
}

main()
  .catch((e) => console.error('Erreur:', e))
  .finally(() => prisma.$disconnect())