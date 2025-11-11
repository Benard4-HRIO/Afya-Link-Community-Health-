// seed.js
const { sequelize } = require('./config/database');
const EducationContent = require('./models/EducationContent');

async function seedContent() {
  try {
    await sequelize.sync({ alter: true });

    await EducationContent.bulkCreate([
      // ===================== NUTRITION =====================
      {
        id: 'nutrition-video-1',
        title: 'Healthy Nutrition for Families',
        description: 'Learn practical nutrition strategies to benefit your family and maintain good health.',
        content: `# Healthy Nutrition for Families

## Why Family Nutrition Matters

Good nutrition is essential for every member of your family, from children to adults. Proper eating habits help:

• **Children grow strong** and develop properly
• **Adults maintain energy** and prevent diseases
• **Elderly family members** stay healthy and active
• **Everyone build strong immunity** against infections

## Practical Family Nutrition Tips

### 1. Balanced Meals
Serve meals that include:
- **Carbohydrates**: Ugali, rice, potatoes for energy
- **Proteins**: Beans, fish, eggs, meat for growth and repair
- **Vegetables**: Sukuma wiki, spinach, carrots for vitamins
- **Fruits**: Local fruits like mangoes, bananas, oranges

### 2. Affordable Healthy Choices
You don't need expensive foods to eat healthy:
- **Beans and lentils** are excellent protein sources
- **Local vegetables** are fresh and affordable
- **Seasonal fruits** provide natural vitamins
- **Whole grains** like brown rice are nutritious

### 3. Meal Planning
- Plan meals for the week to save money
- Cook larger portions for multiple meals
- Involve children in meal preparation
- Eat together as a family when possible

## Common Nutrition Mistakes to Avoid

❌ **Skipping breakfast** - This reduces energy for the day
❌ **Too much sugar** - Leads to energy crashes and health issues
❌ **Not drinking enough water** - Causes dehydration and fatigue
❌ **Eating only one type of food** - Limits nutrient variety

Remember: Small changes in your family's eating habits can make a big difference in everyone's health!`,
        type: 'video',
        category: 'nutrition',
        language: 'en',
        difficulty: 'beginner',
        targetAge: 'all',
        isPublished: true,
        readingTime: 8,
        mediaUrl: 'https://youtu.be/Evji_ebWZQU?si=S7z67Lq8DqIjC2mv',
        viewCount: 1247,
        tags: ['nutrition', 'family', 'health', 'video', 'meal planning'],
        publishedAt: new Date('2024-01-15')
      },
      {
        id: 'nutrition-quiz-1',
        title: 'Lishe Bora kwa Familia',
        description: 'Jifunze mbinu za lishe bora za kufaa familia yako na kudumisha afya njema.',
        content: `# Lishe Bora kwa Familia

## Kwa Nini Lishe ya Familia Ni Muhimu

Lishe nzuri ni muhimu kwa kila mwanachama wa familia yako, kutoka kwa watoto hadi wazee. Tabia nzuri za kula husaidia:

• **Watoto kukua wenye nguvu** na kukua vizuri
• **Watu wazima kudumisha nishati** na kuzuia magonjwa
• **Wazee wa familia kukaa wenye afya** na wenye nguvu
• **Kila mtu kujenga kinga imara** dhidi ya maambukizi

## Vidokezo Vitumikavyo vya Lishe ya Familia

### 1. Milo ya Uwiano
Pisha milo yenye:
- **Wanga**: Ugali, mchele, viazi kwa nishati
- **Protini**: Maharage, samaki, mayai, nyama kwa ukuaji na ukarabati
- **Mboga**: Sukuma wiki, spinach, karoti kwa vitamini
- **Matunda**: Matunda ya kienyeji kama maembe, ndizi, machungwa

### 2. Chaguzi za Afya Zinazoweza Kushika Bei
Huhitaji vyakula ghali ili kula kwa afya:
- **Maharage na dengu** ni vyanzo bora vya protini
- **Mboga za kienyeji** ni fresh na zinashika bei
- **Matunda ya msimu** hutoa vitamini asili
- **Nafaka nzima** kama mchele wa kahawia ni virutubishi

### 3. Kupanga Milo
- Panga milo kwa wiki ili kuokoa pesa
- Pika sehemu kubwa zaidi kwa milo mingi
- Wahusishe watoto katika utayarishaji wa chakula
- Leni pamoja kama familia iwezekanavyo

## Makosa Ya Kawaida Ya Lishe Ya Kuepuka

❌ **Kupuuza kifungua kinywa** - Hupunguza nishati kwa siku
❌ **Sukari nyingi sana** - Inasababisha kushuka kwa nishati na matatizo ya afya
❌ **Kunywaji maji ya kutosha** - Husababisha ukosefu wa maji na uchovu
❌ **Kula aina moja tu ya chakula** - Hupunguza aina ya virutubishi

Kumbuka: Mabadiliko madogo katika tabia za kula za familia yako yanaweza kufanya tofauti kubwa katika afya ya kila mtu!`,
        type: 'video',
        category: 'nutrition',
        language: 'sw',
        difficulty: 'beginner',
        targetAge: 'all',
        isPublished: true,
        readingTime: 8,
        mediaUrl: 'https://youtu.be/Evji_ebWZQU?si=S7z67Lq8DqIjC2mv',
        viewCount: 892,
        tags: ['lishe', 'familia', 'afya', 'video', 'kupanga chakula'],
        publishedAt: new Date('2024-01-15')
      },
      {
        id: 'nutrition-article-3',
        title: 'Essential Minerals & Vitamins Guide',
        description: 'Complete guide to understanding essential minerals and vitamins for optimal health.',
        content: `# Essential Minerals & Vitamins Guide

## Why Vitamins and Minerals Matter

Vitamins and minerals are essential nutrients that your body needs to work properly. They help with:

• **Growth and development** in children
• **Energy production** for daily activities
• **Immune system function** to fight diseases
• **Bone and tissue repair** after injuries
• **Brain function** and mental clarity

## Essential Vitamins Your Body Needs

### Vitamin A
**Benefits**: Good vision, healthy skin, strong immunity
**Food Sources**: Carrots, sweet potatoes, spinach, mangoes, eggs
**Deficiency Signs**: Night blindness, dry skin, frequent infections

### Vitamin C
**Benefits**: Strong immunity, wound healing, antioxidant protection
**Food Sources**: Oranges, lemons, tomatoes, broccoli, local berries
**Deficiency Signs**: Bleeding gums, slow healing, frequent colds

### Vitamin D
**Benefits**: Strong bones, calcium absorption, mood regulation
**Food Sources**: Sunlight, fish, eggs, fortified milk
**Deficiency Signs**: Weak bones, fatigue, depression

### B Vitamins
**Benefits**: Energy production, brain function, red blood cells
**Food Sources**: Whole grains, beans, nuts, meat, leafy greens
**Deficiency Signs**: Fatigue, anemia, memory problems

## Essential Minerals Your Body Needs

### Calcium
**Benefits**: Strong bones and teeth, muscle function, nerve signals
**Food Sources**: Milk, yogurt, dark leafy greens, small fish with bones
**Daily Need**: 1000-1200mg for adults

### Iron
**Benefits**: Oxygen transport, energy production, immune function
**Food Sources**: Red meat, beans, spinach, fortified cereals
**Special Note**: Women need more iron than men

### Potassium
**Benefits**: Blood pressure control, muscle function, heart health
**Food Sources**: Bananas, potatoes, beans, avocados
**Daily Need**: 3500-4700mg for adults

### Zinc
**Benefits**: Immune function, wound healing, growth in children
**Food Sources**: Meat, beans, nuts, whole grains
**Deficiency Signs**: Slow healing, hair loss, poor appetite

## Practical Tips for Getting Enough Nutrients

1. **Eat Colorful Meals** - Different colors mean different nutrients
2. **Choose Whole Foods** - Processed foods lose nutrients
3. **Cook Properly** - Don't overcook vegetables
4. **Combine Foods** - Some nutrients work better together
5. **Drink Enough Water** - Helps transport nutrients

## Signs You Might Need More Nutrients

• **Constant fatigue** - Could need iron or B vitamins
• **Frequent infections** - Could need vitamin C or zinc
• **Poor night vision** - Could need vitamin A
• **Weak bones** - Could need calcium and vitamin D
• **Slow healing** - Could need vitamin C and zinc

Remember: The best way to get vitamins and minerals is through a varied, balanced diet rather than supplements!`,
        type: 'article',
        category: 'nutrition',
        language: 'en',
        difficulty: 'intermediate',
        targetAge: 'adults',
        isPublished: true,
        readingTime: 7,
        viewCount: 1890,
        tags: ['vitamins', 'minerals', 'nutrition', 'health', 'wellness'],
        publishedAt: new Date('2024-01-12')
      },
      {
        id: 'nutrition-article-4',
        title: 'Madini na Vitamini Muhimu',
        description: 'Mwongozo kamili wa kuelewa madini na vitamini muhimu kwa afya bora.',
        content: `# Madini na Vitamini Muhimu

## Kwa Nini Vitamini na Madini Ni Muhimu

Vitamini na madini ni virutubishi muhimu ambavyo mwili wako unahitaji kufanya kazi vizuri. Vinasaidia kwa:

• **Ukuaji na maendeleo** kwa watoto
• **Uzalishaji wa nishati** kwa shughuli za kila siku
• **Utendaji wa mfumo wa kinga** kupambana na magonjwa
• **Ukarabati wa mifupa na tishu** baada ya majeruhi
• **Utendaji wa ubongo** na uwazi wa kiakili

## Vitamini Muhimu ambavyo Mwili Wako Unahitaji

### Vitamini A
**Faida**: Kuona vizuri, ngozi yenye afya, kinga imara
**Vyanzo vya Chakula**: Karoti, viazi vitamu, spinach, maembe, mayai
**Ishara za Upungufu**: Upofu wa usiku, ngozi kavu, maambukizi mara kwa mara

### Vitamini C
**Faida**: Kinga imara, uponyaji wa majeraha, ulinzi wa oxidant
**Vyanzo vya Chakula**: Machungwa, malimao, nyanya, broccoli, berries za kienyeji
**Ishara za Upungufu**: Uvujaji wa damu kwenye fizi, uponyaji polepole, mafua mara kwa mara

### Vitamini D
**Faida**: Mifupa imara, unyaji wa kalisi, udhibiti wa hisia
**Vyanzo vya Chakula**: Mwanga wa jua, samaki, mayai, maziwa yenye virutubishi
**Ishara za Upungufu**: Mifupa dhaifu, uchovu, unyogovu

### Vitamini B
**Faida**: Uzalishaji wa nishati, utendaji wa ubongo, seli nyekundu za damu
**Vyanzo vya Chakula**: Nafaka nzima, maharage, njugu, nyama, mboga majani
**Ishara za Upungufu**: Uchovu, upungufu wa damu, matatizo ya kumbukumbu

## Madini Muhimu ambayo Mwili Wako Unahitaji

### Kalisi
**Faida**: Mifupa na meno imara, utendaji wa misuli, ishara za neva
**Vyanzo vya Chakula**: Maziwa, yogurt, mboga majani meusi, samaki wadogo wenye mifupa
**Mahitaji ya Kila Siku**: 1000-1200mg kwa watu wazima

### Chuma
**Faida**: Usafirishaji wa oksijeni, uzalishaji wa nishati, utendaji wa kinga
**Vyanzo vya Chakula**: Nyama nyekundu, maharage, spinach, nafaka zilizoimarishwa
**Kumbuka Maalum**: Wanawake wanahitaji chuma zaidi kuliko wanaume

### Potasiam
**Faida**: Kudhibiti shinikizo la damu, utendaji wa misuli, afya ya moyo
**Vyanzo vya Chakula**: Ndizi, viazi, maharage, parachichi
**Mahitaji ya Kila Siku**: 3500-4700mg kwa watu wazima

### Zinc
**Faida**: Utendaji wa kinga, uponyaji wa majeraha, ukuaji kwa watoto
**Vyanzo vya Chakula**: Nyama, maharage, njugu, nafaka nzima
**Ishara za Upungufu**: Uponyaji polepole, upotezaji wa nywele, hamu duni ya kula

## Vidokezo Vitumikavyo vya Kupata Virutubishi Vya Kutosha

1. **La Milo ya Rangi** - Rangi tofauti zina maana virutubishi tofauti
2. **Chagua Vyakula Vizima** - Vyakula vilivyotengenezwa hupoteza virutubishi
3. **Pika Kwa Usahihi** - Usipikishe mboga kupita kiasi
4. **Changanya Vyakula** - Baadhi ya virutubishi hufanya kazi vizuri pamoja
5. **Nywa Maji Ya Kutosha** - Inasaidia kusafirisha virutubishi

## Ishara Zako Huenda Unahitaji Virutubishi Zaidi

• **Uchovu wa kila mara** - Huenda unahitaji chuma au vitamini B
• **Maambukizi mara kwa mara** - Huenda unahitaji vitamini C au zinc
• **Kuona vibaya usiku** - Huenda unahitaji vitamini A
• **Mifupa dhaifu** - Huenda unahitaji kalisi na vitamini D
• **Uponyaji polepole** - Huenda unahitaji vitamini C na zinc

Kumbuka: Njia bora ya kupata vitamini na madini ni kupitia lishe mbalimbali, ya uwiano badala ya virutubishi nyongeza!`,
        type: 'article',
        category: 'nutrition',
        language: 'sw',
        difficulty: 'intermediate',
        targetAge: 'adults',
        isPublished: true,
        readingTime: 7,
        viewCount: 1750,
        tags: ['vitamini', 'madini', 'lishe', 'afya', 'ustawi'],
        publishedAt: new Date('2024-01-12')
      },

      // ===================== MENTAL WELLNESS =====================
      {
        id: 'mental-article-1',
        title: 'Complete Stress Management Guide',
        description: 'Comprehensive techniques to manage daily stress and improve mental wellbeing.',
        content: `# Complete Stress Management Guide

## Understanding Stress

Stress is your body's response to challenges or demands. While some stress is normal, too much can affect your health. Common stress sources in our community include:

• **Financial pressures** and work demands
• **Family responsibilities** and caregiving
• **Health concerns** for yourself or loved ones
• **Community challenges** and social pressures

## Physical Signs of Too Much Stress

Your body tells you when stress is becoming a problem:

• **Headaches** or muscle tension
• **Stomach problems** or digestive issues
• **Sleep difficulties** - too much or too little
• **Constant fatigue** even after resting
• **Changes in appetite** - eating more or less

## Practical Stress Management Techniques

### 1. Breathing Exercises
**Simple 4-7-8 Method:**
- Breathe in through your nose for 4 seconds
- Hold your breath for 7 seconds
- Breathe out through your mouth for 8 seconds
- Repeat 3-4 times whenever you feel stressed

### 2. Physical Activity
**Easy ways to move:**
- Walk around your neighborhood for 15 minutes
- Dance to your favorite music at home
- Stretch gently when you wake up
- Do household chores actively

### 3. Social Connection
**Stay connected:**
- Talk to a trusted friend or family member
- Join community groups or activities
- Share your feelings instead of keeping them inside
- Ask for help when you need it

### 4. Healthy Routines
**Create balance:**
- Set regular sleep and wake times
- Eat meals at consistent times
- Take short breaks during work
- Schedule time for things you enjoy

### 5. Mindfulness Practices
**Stay present:**
- Notice your surroundings - what you see, hear, feel
- Focus on one task at a time
- Practice gratitude - think of 3 good things each day
- Accept that some things are beyond your control

## Community-Specific Stress Relief

### Traditional Methods That Work
• **Social gatherings** with family and friends
• **Singing and dancing** together
• **Sharing stories** and experiences
• **Helping neighbors** in need

### Modern Adaptations
• **Phone calls** to distant relatives
• **Community WhatsApp groups** for support
• **Local exercise groups** in public spaces
• **Church or mosque activities** for spiritual support

## When to Seek Professional Help

Consider talking to a healthcare provider if you experience:

• **Constant worry** that doesn't go away
• **Difficulty performing** daily tasks
• **Changes in eating or sleeping** that last weeks
• **Thoughts of harming** yourself or others
• **Using alcohol or drugs** to cope

## Building Long-Term Resilience

### Develop Healthy Coping Skills
• **Problem-solving** - break big problems into small steps
• **Positive thinking** - focus on what you can control
• **Time management** - prioritize important tasks
• **Self-care** - make time for your own needs

### Create Support Systems
• **Family support** - communicate openly with loved ones
• **Friend networks** - maintain positive relationships
• **Community resources** - know where to get help
• **Professional support** - don't hesitate to seek counseling

Remember: Managing stress is a skill that improves with practice. Start with small steps and be patient with yourself.`,
        type: 'article',
        category: 'mental_wellness',
        language: 'en',
        difficulty: 'beginner',
        targetAge: 'all',
        isPublished: true,
        readingTime: 8,
        viewCount: 2150,
        tags: ['stress', 'mental health', 'wellness', 'coping', 'community'],
        publishedAt: new Date('2024-01-14')
      },
      {
        id: 'mental-article-2',
        title: 'Mwongozo Kamili wa Kudhibiti Msongo',
        description: 'Mbinu kamili za kudhibiti msongo wa kila siku na kuboresha ustawi wa akili.',
        content: `# Mwongozo Kamili wa Kudhibiti Msongo

## Kuelewa Msongo

Msongo ni majibu ya mwili wako kwa changamoto au mahitaji. Ingawa msongo fulani ni wa kawaida, mwingi sana unaweza kuathiri afya yako. Vyanzo vya kawaida vya msongo katika jamii yetu ni pamoja na:

• **Shinikizo la kifedha** na mahitaji ya kazi
• **Wajibu wa familia** na utunzaji
• **Wasiwasi wa afya** kwa wewe mwenyewe au wapendwa
• **Changamoto za jamii** na shinikizo za kijamii

## Ishara za Kimwili za Msongo Mwingi Sana

Mwili wako unakuambia wakati msongo unakuwa shida:

• **Maumivu ya kichwa** au mvutano wa misuli
• **Matatizo ya tumbo** au masuala ya mmengenyuko
• **Ugumu wa kulala** - kupita kiasi au kidogo sana
• **Uchovu wa kila mara** hata baada ya kupumzika
• **Mabadiliko ya hamu ya kula** - kula zaidi au kidogo

## Mbinu Vitumikavyo za Kudhibiti Msongo

### 1. Mazoezi ya Kupumua
**Njia Rahisi ya 4-7-8:**
- Vuta pumzi kupitia pua kwa sekunde 4
- Shika pumzi yako kwa sekunde 7
- Toa pumzi kupitia mdomo kwa sekunde 8
- Rudia mara 3-4 wakati wowote unahisi msongo

### 2 **Shughuli ya Kimwili**
**Njia rahisi za kusonga mwili:**
- Tembea karibu na mtaa wako kwa dakika 15
- Cheza kwa muziki unayopenda nyumbani
- Nyosha upole unapoamka
- Fanya kazi za nyumbani kwa bidii

### 3. Muunganisho wa Kijamii
** Kaa ukiwa na muunganisho:**
- Zungumza na rafiki au mwanafamilia unaemuamini
- Jiunge na vikundi vya jamii au shughuli
- Shiriki hisia zako badala ya kuzibeba ndani
- Omba msaada unapohitaji

### 4. Mazoea ya Afya
** Unda usawa:**
- Weka nyakati za kulala na kuamka
- La milo kwa nyakati thabiti
- Chukua mapumziko mafupi wakati wa kazi
- Panga wakati wa mambo unayofurahia

### 5. Mazoezi ya Kukaa na Ulimwengu
** Kaa na wakati uliopo:**
- Angalia mazingira yako - unachoona, kusikia, kuhisi
- Lenga kazi moja kwa wakati
- Zoea shukrani - fikiria mambo 3 mazuri kila siku
- Kubali kwamba mambo fulani yako nje ya udhibiti wako

## Kupunguza Msongo Maalum kwa Jamii

### Mbinu za Kitamadili Zinazofanya kazi
• ** Mikusanyiko ya kijamii** na familia na marafiki
• ** Kuimba na kucheza** pamoja
• ** Kushiriki hadithi** na uzoefu
• ** Kusaidia majirani** wenye hitaji

### Marekebisho ya Kisasa
• ** Simu** kwa jamaa wa mbali
• ** Vikundi vya WhatsApp vya jamii** kwa msaada
• ** Vikundi vya mazoezi vya ndani** katika nafasi za umma
• ** Shughuli za kanisa au msikiti** kwa msaada wa kiroho

## Wakati wa Kutafuta Msaada wa Kitaalamu

Fikiria kuzungumza na mhudumu wa afya ikiwa unapata:

• ** Wasiwasi wa kila mara** ambao haupoti
• ** Ugumu wa kufanya** kazi za kila siku
• ** Mabadiliko katika kula au kulala** ambayo hudumu wiki
• ** Mawazo ya kujidhuru** wewe mwenyewe au wengine
• ** Kutumia pombe au dawa za kulevya** kukabiliana

## Kujenga Uvumilivu wa Muda Mrefu

### Kukuza Ujuzi wa Kukabiliana na Afya
• ** Kutatua matatizo** - vunja matatizo makubwa kuwa hatua ndogo
• ** Fikiria chanya** - lenga kile unaweza kudhibiti
• ** Usimamizi wa wakati** - weka kipaumbele kazi muhimu
• ** Utunzaji binafsi** - fanya wakati wa mahitaji yako mwenyewe

### Unda Mifumo ya Msaada
• ** Msaada wa familia** - wasiliana kwa uwazi na wapendwa
• ** Mitandao ya marafiki** - dumisha uhusiano chanya
• ** Rasilimali za jamii** - jua wapi kupata msaada
• ** Msaada wa kitaalamu** - usisite kutafuta ushauri

Kumbuka: Kudhibiti msongo ni ujuzi unaoboreshwa kwa mazoezi. Anza na hatua ndogo na kuwa mvumilivu na wewe mwenyewe.`,
        type: 'article',
        category: 'mental_wellness',
        language: 'sw',
        difficulty: 'beginner',
        targetAge: 'all',
        isPublished: true,
        readingTime: 8,
        viewCount: 1980,
        tags: ['msongo', 'afya ya akili', 'ustawi', 'kukabiliana', 'jamii'],
        publishedAt: new Date('2024-01-14')
      },

      // ===================== HYGIENE =====================
      {
        id: 'hygiene-guide-1',
        title: 'Complete Hand Hygiene Guide',
        description: 'Everything you need to know about proper hand washing to prevent disease spread.',
        content: `# Complete Hand Hygiene Guide

## Why Hand Hygiene is Crucial

Your hands are the main way germs spread between people and surfaces. Proper hand hygiene can prevent:

• **80% of common infectious diseases** like colds and flu
• **50% of foodborne illnesses** from contaminated food
• **30% of diarrhea-related sicknesses** in children
• **Spread of serious infections** in healthcare settings

## The Science Behind Hand Washing

### How Germs Spread
Germs are invisible microorganisms that can cause disease. They spread through:

• **Direct contact** - shaking hands, touching others
• **Indirect contact** - touching contaminated surfaces
• **Droplet transmission** - coughs and sneezes
• **Food and water** - contaminated consumption

### When Hand Washing Works
Soap and water work by:
- **Breaking down grease** and dirt that contain germs
- **Lifting germs** off your skin surface
- **Rinsing away** the germs and dirt
- **Reducing germ count** by up to 99.9%

## Complete Hand Washing Technique

### Step-by-Step Proper Method

1. **Wet Hands** - Use clean, running water (warm or cold)
2. **Apply Soap** - Use enough to cover all hand surfaces
3. **Rub Palms** - Rub hands together palm to palm
4. **Between Fingers** - Right palm over left with interlaced fingers, then switch
5. **Back of Hands** - Palm to palm with fingers interlaced
6. **Thumbs** - Rotational rubbing of left thumb clasped in right palm, then switch
7. **Fingertips** - Rotational rubbing backwards and forwards with clasped fingers of right hand in left palm, then switch
8. **Wrists** - Don't forget to wash wrists too
9. **Rinse Thoroughly** - Under clean, running water
10. **Dry Completely** - Use clean towel or air dry

### Time Matters
• **Minimum time**: 20 seconds (sing "Happy Birthday" twice)
• **When visibly dirty**: 40-60 seconds
• **After specific activities**: Always wash longer

## Critical Times for Hand Washing

### Always Wash Before:
• **Preparing food** or handling ingredients
• **Eating meals** or snacks
• **Caring for sick people**
• **Treating wounds** or giving medicine
• **Touching your face**, eyes, or mouth

### Always Wash After:
• **Using the toilet** or helping others use it
• **Changing diapers** or cleaning up accidents
• **Handling raw food**, especially meat and eggs
• **Touching animals** or animal waste
• **Coughing, sneezing**, or blowing your nose
• **Handling garbage** or cleaning
• **Returning home** from public places

## Hand Sanitizer as Alternative

### When to Use Sanitizer
• **When soap and water aren't available**
• **In healthcare settings** between patient contacts
• **After touching public surfaces** like doorknobs
• **Before eating** if you can't wash hands

### Proper Sanitizer Use
• **Use enough** to cover all hand surfaces
• **Rub thoroughly** for 20-30 seconds
• **Cover all areas** - palms, backs, between fingers
• **Let it dry** completely - don't wipe off

### Limitations of Sanitizer
• **Doesn't work** on visibly dirty hands
• **May not kill** all types of germs
• **Can't remove** chemicals or pesticides
• **Less effective** against some viruses

## Teaching Children Hand Hygiene

### Make It Fun and Educational
• **Sing songs** while washing (20-second songs)
• **Use colorful soap** or fun dispensers
• **Create hand washing charts** with stickers
• **Lead by example** - wash your hands together
• **Explain why** it's important in simple terms

### Child-Specific Tips
• **Help them reach** the sink safely
• **Use step stools** if needed
• **Supervise** until they can do it properly
• **Make sure they dry** hands completely

## Common Hand Washing Mistakes

### Mistakes to Avoid
❌ **Rushing** - not washing long enough
❌ **Missing areas** - especially thumbs and fingertips
❌ **Using too little soap** - not enough to cover hands
❌ **Not drying properly** - wet hands spread more germs
❌ **Touching surfaces** after washing
❌ **Using dirty towels** to dry hands

## Community Impact

Good hand hygiene in our community can:
• **Reduce school absences** from illness
• **Lower healthcare costs** for families
• **Increase productivity** at work
• **Protect vulnerable members** - elderly and children
• **Prevent outbreak spread** during flu season

Remember: Clean hands save lives! Make hand washing a regular habit for you and your family.`,
        type: 'guide',
        category: 'hygiene',
        language: 'en',
        difficulty: 'beginner',
        targetAge: 'all',
        isPublished: true,
        readingTime: 6,
        viewCount: 2870,
        tags: ['handwashing', 'hygiene', 'prevention', 'germs', 'health'],
        publishedAt: new Date('2024-01-05')
      },

      // ===================== PREVENTIVE CARE =====================
      {
        id: 'preventive-article-1',
        title: 'Complete Disease Prevention Guide',
        description: 'Comprehensive strategies to protect yourself and family from common community diseases.',
        content: `# Complete Disease Prevention Guide

## Understanding Disease Prevention

Preventive healthcare focuses on stopping diseases before they start. In our community, this approach can significantly reduce illness and improve quality of life. Prevention works at three levels:

• **Primary Prevention** - Stopping diseases from occurring
• **Secondary Prevention** - Early detection and treatment
• **Tertiary Prevention** - Managing existing diseases to prevent complications

## Essential Preventive Practices

### 1. Vaccination Protection
**Why it matters**: Vaccines train your immune system to fight specific diseases

**Essential vaccines for our community**:
• **Childhood vaccines** - measles, polio, whooping cough
• **Tetanus protection** - especially for agricultural workers
• **Flu vaccines** - annual protection for vulnerable groups
• **COVID-19 boosters** - as recommended by health authorities

**Where to get vaccinated**:
- Local health centers
- Mobile vaccination clinics
- Community health days
- Private healthcare providers

### 2. Regular Health Screenings
**Early detection saves lives** through:

**Blood pressure checks**:
- **Frequency**: Every 6 months for adults over 40
- **Where**: Local clinics, pharmacy screenings
- **Why**: Detects hypertension before complications

**Blood sugar tests**:
- **Frequency**: Annually for adults over 45
- **Risk factors**: Family history, overweight, sedentary lifestyle
- **Why**: Early diabetes detection prevents organ damage

**Cancer screenings**:
- **Breast cancer**: Self-exams monthly, clinical exams annually
- **Cervical cancer**: Pap smears every 3 years for women 21-65
- **Prostate cancer**: Discussion with doctor for men over 50
- **Colon cancer**: Screening from age 45-75

### 3. Nutrition and Exercise
**Building strong defenses** through lifestyle:

**Nutrition foundations**:
- **Eat colorful vegetables** - different colors provide different protections
- **Choose whole grains** - fiber supports digestive health
- **Include lean proteins** - building blocks for immune cells
- **Limit processed foods** - reduce inflammation and disease risk

**Physical activity guidelines**:
- **Minimum**: 150 minutes moderate activity weekly
- **Examples**: Brisk walking, dancing, gardening, cycling
- **Strength training**: 2 days per week for muscle and bone health
- **Every movement counts** - housework, walking errands

### 4. Environmental Health
**Creating safe living spaces**:

**Water safety**:
- **Drink treated water** - boil or filter if uncertain
- **Store water properly** - covered containers, regular cleaning
- **Recognize contamination signs** - unusual color, odor, particles

**Food safety**:
- **Separate raw and cooked foods** - prevent cross-contamination
- **Cook thoroughly** - especially meat, poultry, eggs
- **Store properly** - refrigerate promptly, use within safe periods
- **Clean surfaces** - after preparing raw foods

**Home environment**:
- **Control pests** - eliminate standing water, seal food containers
- **Ensure ventilation** - open windows regularly
- **Reduce dust** - regular cleaning, especially in sleeping areas
- **Safe waste disposal** - proper garbage management

## Community-Specific Prevention

### Local Disease Patterns
Understanding common community health issues:

**Respiratory infections**:
- **Prevention**: Good ventilation, avoiding crowded spaces when sick
- **Protection**: Mask-wearing during outbreaks, hand hygiene
- **Risk reduction**: Smoking cessation, air quality improvement

**Waterborne diseases**:
- **Prevention**: Safe water practices, proper sanitation
- **Protection**: Water treatment, hand washing before eating
- **Risk reduction**: Community sanitation improvements

**Vector-borne diseases**:
- **Prevention**: Mosquito control, proper waste management
- **Protection**: Bed nets, appropriate clothing, repellents
- **Risk reduction**: Environmental management, community clean-ups

## Building Family Health Resilience

### Creating Family Health Plans
**Essential elements**:
• **Emergency contacts** - local healthcare providers, emergency services
• **Medical history** - conditions, medications, allergies for each family member
• **Vaccination records** - up-to-date documentation
• **Insurance information** - policy numbers, coverage details
• **Regular check-up schedule** - appointments and reminders

### Health Education at Home
**Teaching prevention** to family members:
• **Age-appropriate lessons** for children about hygiene
• **Cooking demonstrations** for healthy meal preparation
• **Exercise routines** the whole family can enjoy
• **Stress management techniques** for mental wellbeing

## Recognizing Early Warning Signs

### When to Seek Medical Attention
**Don't ignore these symptoms**:

**General warning signs**:
- Unexplained weight loss
- Persistent fever
- Severe fatigue that doesn't improve with rest
- Changes in bowel or bladder habits
- Unusual bleeding or discharge

**Specific concerning symptoms**:
- Chest pain or pressure
- Difficulty breathing
- Severe abdominal pain
- Sudden vision changes
- Weakness or numbness on one side

## Cost-Effective Prevention

### Affordable Prevention Strategies
**Low-cost, high-impact approaches**:

**Free community resources**:
- Health education workshops
- Screening events
- Vaccination campaigns
- Exercise groups in public spaces

**Home-based prevention**:
- Kitchen gardening for fresh vegetables
- Home exercise using household items
- Stress reduction through meditation and breathing
- Sleep hygiene improvements

**Lifestyle adjustments**:
- Walking instead of short vehicle trips
- Cooking at home instead of eating out
- Reducing sugar-sweetened beverages
- Increasing water consumption

## Long-Term Health Maintenance

### Building Lasting Habits
**Sustainable prevention practices**:

**Consistent routines**:
- Daily physical activity
- Regular sleep schedules
- Balanced meal patterns
- Stress management practices

**Regular health monitoring**:
- Monthly self-exams
- Annual check-ups
- Dental visits every 6 months
- Vision checks as needed

**Continuous learning**:
- Stay informed about health updates
- Attend community health talks
- Share knowledge with family and friends
- Adapt practices as new information emerges

Remember: Prevention is the most powerful medicine. Small, consistent actions today can prevent major health problems tomorrow. Your health is your wealth - invest in it through preventive care!`,
        type: 'article',
        category: 'preventive_care',
        language: 'en',
        difficulty: 'intermediate',
        targetAge: 'adults',
        isPublished: true,
        readingTime: 9,
        viewCount: 2340,
        tags: ['prevention', 'health', 'screening', 'vaccination', 'community'],
        publishedAt: new Date('2024-01-03')
      },

      // Add the rest of your content here...
      // Continue with your existing quizzes, videos, and other content...
    ], { ignoreDuplicates: true });

    console.log('✅ Enhanced education content seeded successfully!');
    console.log(`📚 Added ${await EducationContent.count()} education content items`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedContent();
}

module.exports = { seedContent };