import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const senegalData = {
  regions: [
    {
      name: 'Dakar',
      departments: [
        { name: 'Dakar', communes: ['Dakar-Plateau', 'Médina', 'Gorée', 'Gueule Tapée-Fass-Colobane', 'Fann-Point E-Amitié', 'Grand Dakar', 'Biscuiterie', 'HLM', 'Hann-Bel Air', 'Sicap-Liberté', 'Dieuppeul-Derklé', 'Grand Yoff', "Patte d'Oie", 'Parcelles Assainies', 'Cambérène', 'Ngor', 'Ouakam', 'Yoff', 'Mermoz-Sacré Cœur'] },
        { name: 'Pikine', communes: ['Pikine Ouest', 'Pikine Est', 'Pikine Nord', 'Dalifort', 'Djiddah Thiaroye Kao', 'Guinaw Rail Nord', 'Guinaw Rail Sud', 'Thiaroye Gare', 'Thiaroye-sur-Mer', 'Tivaouane Diacksao', 'Mbao', 'Diamaguène-Sicap Mbao'] },
        { name: 'Guédiawaye', communes: ['Golf Sud', 'Sam Notaire', 'Ndiarème Limamoulaye', 'Wakhinane Nimzatt', 'Médina Gounass'] },
        { name: 'Rufisque', communes: ['Rufisque Est', 'Rufisque Ouest', 'Rufisque Nord', 'Bargny', 'Sébikotane', 'Diamniadio', 'Sangalkam', 'Bambylor', 'Jaxaay-Parcelles', 'Tivaouane Peulh-Niaga', 'Yenne', 'Sendou'] },
        { name: 'Keur Massar', communes: ['Keur Massar Nord', 'Keur Massar Sud', 'Yeumbeul Nord', 'Yeumbeul Sud'] }
      ]
    },
    {
      name: 'Thiès',
      departments: [
        { name: 'Thiès', communes: ['Ville de Thiès Nord', 'Ville de Thiès Est', 'Ville de Thiès Ouest', 'Khombole', 'Pout', 'Kayar', 'Fandène', 'Keur Moussa', 'Diender', 'Notto Diobass', 'Thiénaba', 'Ngoudiane', 'Touba Toul', 'Tassette', 'Cherif Lo'] },
        { name: 'Mbour', communes: ['Mbour', 'Joal-Fadiouth', 'Saly Portudal', 'Ngaparou', 'Somone', 'Popenguine-Ndayane', 'Malicounda', 'Diass', 'Sindia', 'Ndiaganiao', 'Fissel', 'Sessène', 'Sandiara', 'Nguéniène', 'Thiadiaye', 'Nguekhokh'] },
        { name: 'Tivaouane', communes: ['Tivaouane', 'Méké', 'Mboro', 'Pire Goureye', 'Darou Khoudoss', 'Taïba Ndiaye', 'Notto Gouye Diama', 'Meouane', 'Mérina Dakhar', 'Niakhène', 'Ngandiouf', 'Pambal', 'Cherif Lo Tivaouane', 'Mont-Rolland', 'Tibane', 'Koul', 'Méouane Tivaouane', 'Darou Mousty', 'Keur Malick Lar', 'Sambaye', 'Merina Dakhar Tivaouane'] }
      ]
    },
    {
      name: 'Diourbel',
      departments: [
        { name: 'Diourbel', communes: ['Diourbel', 'Ndindy', 'Ndoulo', 'Ngohe', 'Patar', 'Tocky Gare', 'Touré Mbonde', 'Dankh Sène', 'Gade Escale', 'Keur Ngalgou', 'Ndankh Sène', 'Thiamène'] },
        { name: 'Bambey', communes: ['Bambey', 'Baba Garage', 'Lambaye', 'Ngogom', 'Ndangalma', 'Dinguiraye', 'Gawane', 'Keur Samba Kane', 'Refane', 'Thiakhar', 'Ngoye', 'Diohine'] },
        { name: 'Mbacké', communes: ['Mbacké', 'Touba Mosquée', 'Dalla Ngabou', 'Kael', 'Madina', 'Missirah', 'Sadio', 'Taïba Thiékène', 'Touba Fall', 'Touba Mboul', 'Ngabi', 'Ndame', 'Dékhé Wolof', 'Mbaké Wolof', 'Ndindy Ndiaye', 'Bakakhadi'] }
      ]
    },
    {
      name: 'Saint-Louis',
      departments: [
        { name: 'Saint-Louis', communes: ['Saint-Louis', 'Mpal', 'Fass Ngom', 'Gandon', 'Ndiébène Gandiole'] },
        { name: 'Dagana', communes: ['Dagana', 'Richard-Toll', 'Rosso Sénégal', 'Gaé', 'Ross Béthio', 'Ronkh', 'Gnith', 'Diama', 'Bokhol', 'Mbane', 'Ndombo Hedar'] },
        { name: 'Podor', communes: ['Podor', 'Ndioum', 'Guédé Chantier', 'Golléré', 'Mboumba', 'Aéré Lao', 'Fanaye', 'Doumga Lao', 'Gamadji Saré', 'Guédé Village', 'Madina Diathbé', 'Méry', 'Ndiayène Pentao', 'Walaldé', 'Bodé Lao', 'Dodel', 'Galoya Sarr', 'Netteboulou', 'Niandane', 'Pété', 'Saldé', 'Thillé Boubacar', 'Troungoumbé'] }
      ]
    },
    {
      name: 'Louga',
      departments: [
        { name: 'Louga', communes: ['Louga', 'Ndiagne', 'Niomré', 'Coki', 'Léona', 'Potou', 'Gandé', 'Keur Momar Sarr', 'Mbédié', 'Sakal', 'Syer', 'Mbeuleukhé', 'Dara Mousty', 'Guede Chantier Louga', 'Kelle Gueye', 'Ndiague Ndiaw', 'Nguerigne'] },
        { name: 'Linguère', communes: ['Linguère', 'Dahra', 'Barkédji', 'Dodji', 'Ouarkhokh', 'Kamb', 'Yang-Yang', 'Sagatta Dioloff', 'Mbeuleukhé Linguère', 'Barkedji', 'Gueye Sérère', 'Dodouc', 'Thiel', 'Nguith', 'Baré Ndiob', 'Sagatta Gueth', 'Thiel Ndiaye', 'Keur Samba Kane Linguère', 'Dahra Linguère'] },
        { name: 'Kébémer', communes: ['Kébémer', 'Guéoul', 'Ndande', 'Sagatta Gueth Kébémer', 'Thieppe', 'Darou Marnane', 'Darou Mousty Kébémer', 'Diokoul Diawrigne', 'Sam Yabal', 'Touba Mérina', 'Meouane Kébémer', 'Lompoul', 'Mboro Kébémer', 'Ndiayène Pendao', 'Sagatta Dioloff Kébémer', 'Thieppe Kébémer', 'Darou Khoudoss Kébémer', 'Merina Dakhar Kébémer', 'Taïba Ndiaye Kébémer'] }
      ]
    },
    {
      name: 'Fatick',
      departments: [
        { name: 'Fatick', communes: ['Fatick', 'Dioffior', 'Diakhao', 'Fimela', 'Niakhar', 'Diarrère', 'Diaoulé', 'Djilass', 'Mbéllacadiao', 'Ndiob', 'Ngayokhème', 'Palmarin Facao', 'Tattaguine', 'Thiaré Ndialgui', 'Sobar', 'Djilor Fatick', 'Loul Sessène'] },
        { name: 'Foundiougne', communes: ['Foundiougne', 'Sokone', 'Passy', 'Karang Poste', 'Soum', 'Toubacouta', 'Keur Saloum Diané', 'Djilor', 'Diossong', 'Mbam', 'Bassoul', 'Dionewar', 'Djirnda', 'Nioro Alassane Tall', 'Toukar', 'Ndiobène', 'Djirnda Foundiougne'] },
        { name: 'Gossas', communes: ['Gossas', 'Colobane', 'Ouadiour', 'Mbar', 'Ndiene Lagane', 'Patar Lia'] }
      ]
    },
    {
      name: 'Kaolack',
      departments: [
        { name: 'Kaolack', communes: ['Kaolack', 'Kahone', 'Gandiaye', 'Ndoffane', 'Sibassor', 'Latmingué', 'Keur Baka', 'Keur Socé', 'Ndiaffate', 'Ndiébène Gandiaye', 'Thiomby', 'Mbang', 'Kouth', 'Ndanda'] },
        { name: 'Nioro du Rip', communes: ['Nioro', 'Keur Madiabel', 'Paos Koto', 'Médina Sabakh', 'Gainthé Kaye', 'Dabaly', 'Darou Salam', 'Porokhane', 'Taïba Niassène', 'Wack Ngouna', 'Ngari Ngouro', 'Keur Alassa', 'Diamaguène', 'Mboss Ndiébé', 'Mbadakhoune'] },
        { name: 'Guinguinéo', communes: ['Guinguinéo', 'Fass', 'Mboss', 'Gagnick', 'Khelcom', 'Nguélou', 'Ourour', 'Panal Wolof', 'Thiaré', 'Ndiedieng', 'Nguélou Guinguinéo', 'Dara Mboss'] }
      ]
    },
    {
      name: 'Kaffrine',
      departments: [
        { name: 'Kaffrine', communes: ['Kaffrine', 'Nganda', 'Gniby', 'Kathiote', 'Diokoul Mbelbouck', 'Medinatoul Salam', 'Boulel', 'Maka Yopp Kaffrine', 'Sintiou Maleme', 'Mékhé Kaffrine'] },
        { name: 'Koungheul', communes: ['Koungheul', 'Ida Mouride', 'Saly Escale', 'Fass Thiékène', 'Gainth Pathé', 'Lour Escale', 'Maka Yopp', 'Missirah Wadene', 'Ndiobene Koungheul', 'Passy Koungheul'] },
        { name: 'Birkelane', communes: ['Birkelane', 'Mabo', 'Keur Mboucki', 'Diamal', 'Ndiognick', 'Segre Gatta', 'Lour Escale Birkelane', 'Ngatiagne'] },
        { name: 'Malem Hodar', communes: ['Malem Hodar', 'Ndiobène Samba Lamo', 'Darou Minam', 'Dianke Souf', 'Ndioum Ngainth', 'Djimini', 'Daru Minam'] }
      ]
    },
    {
      name: 'Ziguinchor',
      departments: [
        { name: 'Ziguinchor', communes: ['Ziguinchor', 'Niaguis', 'Nyassia', 'Enampore', 'Adéane', 'Boutoupa-Camaracounda'] },
        { name: 'Bignona', communes: ['Bignona', 'Thionck-Essyl', 'Diouloulou', 'Tenghory', 'Sindian', 'Kafountine', 'Abéné', 'Diegoune', 'Balingore', 'Djibidione', 'Kataba 1', 'Oulampane', 'Suelle', 'Tendimane', 'Kalogne', 'Senghor', 'Djibidione Bignona', 'Ouonk', 'Kandialang'] },
        { name: 'Oussouye', communes: ['Oussouye', 'Diembéring', 'Mlomp', 'Santhiaba Manjacque', 'Loudia Ouolof'] }
      ]
    },
    {
      name: 'Kolda',
      departments: [
        { name: 'Kolda', communes: ['Kolda', 'Dabo', 'Salikégné', 'Saré Yoba Diéga', 'Coumbacara', 'Dioulacolon', 'Guiro Yéro Bocar', 'Mampatim', 'Médina El Hadj', 'Tankanto Escale', 'Djatefa', 'Saré Bidji', 'Bignaré', 'Sitankoto', 'Doumga'] },
        { name: 'Vélingara', communes: ['Vélingara', 'Kounkané', 'Diaobé-Kabendou', 'Linkéring', 'Médina Gounass', 'Bonconto', 'Kandia', 'Némataba', 'Saré Coly Sallé', 'Dembancané', 'Pata Vélingara', 'Saré Yoro Bocar', 'Wouro Hesso', 'Sinthiou Maleme Vélingara'] },
        { name: 'Médina Yoro Foulah', communes: ['Médina Yoro Foulah', 'Pata', 'Fafacourou', 'Badion', 'Bourouco', 'Kéréwane', 'Niaming', 'Ndoré', 'Fafacourou MYF', 'Ndame Kandia', 'Sare Coly Sall'] }
      ]
    },
    {
      name: 'Matam',
      departments: [
        { name: 'Matam', communes: ['Matam', 'Ourossogui', 'Thilogne', 'Nabadji Civol', 'Ogo', 'Bokidiawé', 'Dabia', 'Agnam Civol', 'Oréfondé', 'Nguidjilone'] },
        { name: 'Kanel', communes: ['Kanel', 'Waoundé', 'Semmé', 'Dembancané', 'Hamady Ounaré', 'Sinthiou Bamambé', 'Bakel Kanel', 'Bokiladji', 'Ndendory', 'Wouro Sidy', 'Souglou', 'Diaawaré'] },
        { name: 'Ranérou', communes: ['Ranérou', 'Lougré Thioly', 'Oudalaye', 'Velingara Ferlo'] }
      ]
    },
    {
      name: 'Tambacounda',
      departments: [
        { name: 'Tambacounda', communes: ['Tambacounda', 'Makacolibantang', 'Missirah', 'Dialacoto', 'Niani Toucouleur', 'Neteboulou', 'Kothiary', 'Sinthiou Mambel', 'Diankéma', 'Sanaba'] },
        { name: 'Bakel', communes: ['Bakel', 'Diawara', 'Kidira', 'Ballou', 'Moudéry', 'Gabou', 'Gathiary', 'Madina Foulbé', 'Bélétou', 'Boulisté', 'Dabo Bakel', 'Moussala'] },
        { name: 'Goudiry', communes: ['Goudiry', 'Kothiary Goudiry', 'Boynguel Bamba', 'Bani Israël', 'Dianke Makha', 'Dougué', 'Koulor', 'Sinthiou Mamadou Boubou', 'Beli', 'Gapard', 'Koulor Goudiry', 'Sinthiou Dambélé', 'Wouro Tjodo', 'Toucouleur Goudiry', 'Sinthiou Pété'] },
        { name: 'Koumpentoum', communes: ['Koumpentoum', 'Malem Niani', 'Bamba Thialène', 'Kouthiaba Wolof', 'Pass Koto', 'Payar', 'Ndoumboudji', 'Bounda Baba Ndiaye', 'Sam-Paté', 'Gnibina', 'Ngaré'] }
      ]
    },
    {
      name: 'Sédhiou',
      departments: [
        { name: 'Sédhiou', communes: ['Sédhiou', 'Diannah Malary', 'Marsassoum', 'Diendé', 'Bambali', 'Djibabouya', 'Oudoucar', 'Sakar', 'Djibabouya Sédhiou', 'Boukoto', 'Brekouma', 'Boussaya', 'Diannah Malary Nord', 'Marsassoum Nord'] },
        { name: 'Goudomp', communes: ['Goudomp', 'Tanaff', 'Samine', 'Simbandi Brassou', 'Bagadadji', 'Diattacounda', 'Karantaba', 'Simbandi Balante', 'Bona Sédhiou', 'Djiredji', 'Niaguis Goudomp', 'Samine Goudomp', 'Sédhiou Goudomp', 'Bathelly', 'Bandji'] },
        { name: 'Bounkiling', communes: ['Bounkiling', 'Madina Wandifa', 'Ndiamacouta', 'Boghal', 'Diaroumé', 'Faoune', 'Tankon', 'Balel', 'Boukoto Bounkiling', 'Dar Salam Bounkiling', 'Diannah Bounkiling', 'Ndoukbé', 'Saré Guida', 'Sinthiou Malème'] }
      ]
    },
    {
      name: 'Kédougou',
      departments: [
        { name: 'Kédougou', communes: ['Kédougou', 'Bandafassi', 'Tomboronkoto', 'Dindéfélo', 'Dimboli', 'Ninefécha', 'Fongolembi'] },
        { name: 'Saraya', communes: ['Saraya', 'Bembou', 'Sabodala', 'Khossanto', 'Missirah Sirimana', 'Médina Baffé'] },
        { name: 'Salémata', communes: ['Salémata', 'Dakateli', 'Ethiolo', 'Dar Salam', 'Kewoye', 'Oubadji'] }
      ]
    }
  ]
}

async function main() {
  console.log('Suppression des données existantes...')
  
  await prisma.notification.deleteMany({})
  await prisma.message.deleteMany({})
  await prisma.contribution.deleteMany({})
  await prisma.donation.deleteMany({})
  await prisma.article.deleteMany({})
  await prisma.event.deleteMany({})
  await prisma.member.deleteMany({})
  await prisma.commune.deleteMany({})
  await prisma.department.deleteMany({})
  await prisma.region.deleteMany({})
  
  console.log('Création des nouvelles données...')
  
  let regionCount = 0
  let deptCount = 0
  let communeCount = 0
  
  for (const regionData of senegalData.regions) {
    const region = await prisma.region.create({
      data: { name: regionData.name }
    })
    regionCount++
    console.log('Région créée: ' + regionData.name)

    for (const deptData of regionData.departments) {
      const department = await prisma.department.create({
        data: {
          name: deptData.name,
          regionId: region.id
        }
      })
      deptCount++

      for (const communeName of deptData.communes) {
        await prisma.commune.create({
          data: {
            name: communeName,
            departmentId: department.id
          }
        })
        communeCount++
      }
    }
  }
  
  console.log('\n=== Résumé ===')
  console.log('Régions: ' + regionCount)
  console.log('Départements: ' + deptCount)
  console.log('Communes: ' + communeCount)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
