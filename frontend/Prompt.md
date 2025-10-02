# **"EchoIntellect"**

## **"Where Intelligence Reflects"**

###

### **Mujhe clg ke liye minor-1 project banana hai jisko me aage chalke minor-2, major-1 and major-2 ke liye features ke saath upgrade karta jaunga,**

##### **minor-1 ke liye:-**

##### **Idea:- Mujhe esi website banani hai ki ek box rahe jisme user apna prompt daale or us box ke bottom center pe ek send button ho user prompt daalte hi jese hi send button pe click kare to new page open ho jaaye jisme 4 alag alag ai model ke bot ho (eg: gpt, gemini, perpexlity, deepseek) or user ke dwaara jo prompt bheja gya hai un sab ka responce un chaaro model me generate ho jaaye using each and every models api, because of rapidapi.com se live straming possible nhi hai to jab tak complete responce nahi aa jaata 3 dots waala animations show hona chahiye(eg: like chatbot soch raha hai) and complete responce aa jaane ke baad user ko typing animation dikha ke responce word by word show karna hai taaki user ko achha ui lage, iska techstack kuch is prakaar rahega frontend me reactjs + tailvindcss(latest v4 version) + vite and backend ke liye python use karna hai hai, apis ke liye me rapidapi.com website ka use karunga jo mujhe har model ki api provide karegi using python(import request) jiska example code kuch is prakaar rahega:-**

###### **CODE:-**

###### **""import requests**

######

###### **url = "https://chatgpt-42.p.rapidapi.com/aitohuman"**

######

###### **payload = { "text": "Global warming is the long-term rise in Earth's average temperature due to human activities, primarily the burning of fossil fuels, deforestation, and industrial emissions. These activities release greenhouse gases like carbon dioxide and methane, which trap heat in the atmosphere and lead to climate change. As a result, glaciers are melting, sea levels are rising, and extreme weather events such as hurricanes, heatwaves, and droughts are becoming more frequent. Global warming also threatens biodiversity, disrupts ecosystems, and impacts agriculture, leading to food and water shortages. Urgent action, including reducing carbon emissions, adopting renewable energy, and promoting sustainable practices, is essential to mitigate its effects." }**

###### **headers = {**

###### \*\*  "x-rapidapi-key": "fe50585017msh543e17b3c88ee7cp1f4715jsn501f05d9deb0",\*\*

###### \*\*  "x-rapidapi-host": "chatgpt-42.p.rapidapi.com",\*\*

###### \*\*  "Content-Type": "application/json"\*\*

###### **}**

######

###### **response = requests.post(url, json=payload, headers=headers)**

######

###### **print(response.json())""**

#####

#### **Is code se useful data uthake(jis se api fetch ho sake) mujhe is project ke liye complete frontend code + complete backend code (using python only) generate karke do, make sure isme koi bhi database abhi ke liye use nhi hoga abhi sirf minor 1 ke hisaab se banana hai without any database koi user history abhi ke liye save nhi karni just simple user box me prompt daale sed button dabaate hi 4 alag alag modals ek saath responce generate karne lag jaaye bas iske alawa abhi ke liye or kuch nhi chahiye meko minor 1 me.**

#####

### **Minor 1 ke liye kya kya features dene hai uski detailed list taaki koi bhi confusion ya doubt na reh jaaye:-**

- ###### **A separate copy feature for all chatbots for every responce taaki user directly kisi bhi generated responce ko copy kar sake easily without selecting it.**
- ###### **complete responce aa jaane ke baad typing animation ke jariye response show karna hai.**
- ###### **dark ya light mood ka feature nhi dena hai just simple dark mode rahega (dark theme only).**
- ###### **user kisi bhi model ki complete chat ko(from starting to ending) ko kisi ke bhi paas bhej sakta hai via link of that chat, means jese hi user kisi bhi model ke chatbot me share button dabayega usi particular model ki ek link provide karna hai user ko + ek copy button bhi(link ke just side me) jisko woh copy karke kisi ke bhi paas bhej sake jis se woh another person woh link hamari website pe hi open karke uski chat padh sake without login but only readable feature rahega na wog kuch add kar sakta hai na remove oe na hi, agar usko kuch puchna hai to ek try button rahega jisko daba ke or lofin karke woh bhi apni khud ki chat kar sake.**
- ###### **ek esa feature dena hai jese hi chaaro models ke responce completly generate ho jaaye to ek difference button show ho user ko jisko dabate hi chaaro models ko apas me analyze karke har model me jo jo segment/part/section alag hoga baaki model ke generated responces se woh highlighted ho jaaye chaaro models ke responces me using light colors (model1-light red, model2-light blue, model3-light green, model4-light yellow) i reapeat it again, make sure har model ke responce me unique part ko highlight karna hai.**
- ###### **feedback page dena hai jisme user apna name email or kya feedback/issue hai woh daal ke send kare to hamari website ke official email pe woh msg aa jaaye in email via using appscript.**
- ###### **modals column wise arrange honge(4 modal ke liye full screen window pe 4 models)**
- ###### **project fully responsive rahega and mobile ke liye 1 column ke neeche dusra uske neeche teesra esa karna hai and tablet ke liyee ek row me 2 uske neeche 2 esa karna hai.**
- ###### **user ke paas option ho ki 4 me se koi sa bhi or kitne bhi model use kar sake (eg: user ke enter dabaate hi ek pop up box show hoga jisme user ko jitney bhi model available hai hamari website pe woh show honge user apni marzi se koi bhi model select karle (less than or equal to 4) then woh proceed pe click kare to uske selecting ke order ke hisaab se model arrange hoke responce generate karke de ek saath.**
- ###### **jab chaaro model ke responce completliy generate ho jaaye to user kisi ke bhi model ke header pe click karega to woh akela model full screen mode pe open ho jaayega and ek back button rahega jisko dabaate hi woh wapas chaaro model ke responce waale page me pohoch jaayega.**
- ###### **user home page ke box pe jo prompt likh ke send karega then woh jo models select karega un sabhi model pe ek saath promt send ho jaana chahiye jo model usne proceed ke waqt select kiya tha model selecting ke doraan and sirf wahi model show ho jo user ne select kiya hai baaki ke nhi (eg: user ne bas 2 hi model select kiye to sirf 2 hi model me response send honge and show honge jo user ne select kiye the).**
- ###### **ek signup/signin system rakhna hai which save only in users browser not use a database just normal sa browser based login method jiski help se ham har user ko ek din me har model ke liye bas 15 request denge jese hi user 15th prompt bhej dega phir woh agle 24 ghanta baad hi agla prompt bhej paayega kisi bhi model me.**
- ###### **bina login kare koi bhi prompt accept na ho agar user login nhi hai or prompt likh ke enter dabaaye to login page open ho jaaye and user ka login karna pade mandatory taaki ham properly 15 request gin sake har user ki.**

### **Pages ka structure and design kesi rehene waali hai:-**

- ###### **home page(main page) ke upar ek navbar rahega jiske left side me brand logo and brand name rahega right side me login button rahegi, home page button rahegi, contact page ki button rahegi about page ki button rahegi, background pura dark theme ke according rahega beech me ek box rahega jisme user prompt daalege or box bottom center me send button hogi, and home page ke sabse neeche footer rahega jo same as navabaar rahegsa bas beech me copyright segment rahega and hamari website ke social media handels ki link rahnenge.**
- ###### **about page me bhi same navbar or footer rahega and beech me hamari website ke baare me puri knowledge rahegi kya kya features dete hai woh mention rahega aage kya kya features lane waale hai woh likha rahega, or creators behind making this project section rahega wirh there designation.**
- ###### **contact page me bhi same navbar or footer rahega beech me ek box type rahega jisme user apna naam, email, or feedback/issue likh ke send kar paayega jo appscript ke through direct hamare email me aa jaayega.**
- ###### **login page me na to navbar hoga na footer just ek bada sa box hogas jo 2 column me divide hoga one for signin one for signup user dono me se jis samay jo kar raha hoga to ek Cheecz hide rahegi(eg: default me signin waali side show hogi yadi new user hai to jo side hide hai uske parde me likha rahega new user create a account and signup button jisko dabaate hi woh parda animation ke through slide hoke signin waale column ko hide karke and vice versa for old user).**
- ###### **home page se jo bhi prompt submit ho woh user ke dwaara select kiye har ai model pe ek saath send ho jaaye or ek comparasion page open ho jaaye jaha har model ke responces compare hote ho.**
- ###### **coomparasion page bhi same navbaar or footer hona chahiye and beeche me models hone chahiye column wise user jitney select kare uske according(model<=4) and pe har model ke neeche ek unke liye unka khudka personal propmt bar ho jisme user sirf usi ek particular model ko prompt bhej sake, and footer ke just upar ek universal prompt baar hona chahiye jesa home page pe tha jiske andar user koi prompt daale to woh har model pe ek saath send ho jo user ne select kiya hai.**
- ###### **user har models dwara complete response generate ho jaane pe kisi bhi model ke header pe click kare to woh particular model full screen pe cover ho jaaye with same navbar, footer and full screen waale ai model ke prompt bar ke andar user koi query daale to woh usi model ke paas send honi chahiye sab ke paas nhi.**

### **Yeh neeche likhe features future me add karna hai abhi inka is time koi bhi lena dena nhi hai its just for reference taaki inko future me easily add on kar sake inke karan koi bhi purana code nhi bigde to is hisaab se yeh project generate ho ki baad me easily yeh feature bhi add ho sake bina purana code ko bigaade:-(for minor-2, major1 and major-2 \[techstack- MERN Stack + python + Apis integration]):-**

- ###### **ek premium feature dena hai ki agar user ko confusion hai ki best responce kis model ka hai to user ke liye ham best responce naam ki ek button deni hai jisko click karte hi hamara khud ka ek personal chatbot chaaro models ke generated last responce ko ache se analyze karke un sab me se bestest responce generate karke de like chaaro me se jo sabse jyaada best ho ya also kisi ka kuch part achha hai to kisi ka kuch achha hai to un sab me se jod mila ke bestest and accurate responce user ko generate karke dena hai.**
- ###### **payment ke liye razor pay use karna hai.**
- ###### **backend me ek gmail likha hai is logic ke saath ki yadi koi bhi user usi particular gmail ke saath hamari website pe login karta hai to puri website usko same hi dikhegi but kuch additional admin features show hone lagenge like admin website se hi new models add kar sake ya subscription ka price kam ya bada sake and many more and admin apne changes ke baad jese hi save button pe click karega wese hi sabhi users ko woh change show ho jaana chaiye live it means admin ko koi change karna ho to woh bina code ko chede website me hi change karke save kare to woh sab users ko show hone lage(just by refreshing the page ya back karke again woh page khule to).**
- ###### **ek proper database rakhna hai for every users history(past chats) and a perfect advanced login system with google oauth taaki user directily google se hi login kar sake.**
- ###### **speech to text ke liye mic feature ho jisko dabane se user bolke prompt type karwa sake, uploading files(img, vid, pdf, docs, etc) ka option ho taaki user us se reted kuch puch sake.**
- ###### **ek virtual assistant feature dena hai jisko click karke user or hamara assitent orally ek dusre se baat kar sake and text to speech ke liye eleven labs ki api use karnii hai via rapidapi.com, isme kuch bhi text ka kaam nhi rahega user bhi muh se kuch bolega uske rukte hi hamara assistant bhi mug se hi ans dega uske query ka.**
- ###### **ek leaderboard system banana hai jisme esa feature rahega ki ek mahine ke andar jo user sabse jyada refer karke another user ko hamari website pe login karwa dega usko month ke last me ek mahine ke liye free me saare premium features use karne ko milenge. inshort jese me user hu mene apne 10 dosto ko referral link bheji or unse login karwa liya meri referral link ke througg to meko har successful referral pe 10 points milenge or agar leaderboard ranking me month ke last tak yadi me top pe bana raha baaki users ke comparesion me to mujhe ek mahine ke liye free premium subscription mil jaayega.**
- ###### **ek streak feature banana hai just like snapchat user ko har din ek strak add hote jaayegi agar woh har din hamari website use karke kuch bhi atlest ek prompt bhejta hai to is se user ko koi fydaa nhi rahega just ek streak leaderboard rahega jisme woh apne aap ko dekh sake ki woh continusly hamari website use karne pe kis positions pe aata hai among all users of our website.(this feature is just for user engagement \& entertainment).**

### **Final instruction for proceeding with code generation:-**

- ###### **sirf minor 1 me jo features hai unhi ko build karna hai uske alawa or kisi ko bhi nhi future features bas reference ke liye bataya hai taaki code is hisaab se generate karo ki baad me features add on karne pe puraane features na bigde.**
- ###### **tech stack rahega frontend me reactjs + tailwindcss(latest version v4) + vite, backend me rahega python only without any single database.**
- ###### **har features, har components, har models ke liye alag se file banana sab cheez ek hi file me mat ghusa dena code neet and clean hona chahiye.**
- ###### **mene already ek main folder bana liya hai jiske andar 2 sun folder hai ek frontend or ek backend, frontend ke andar reactjs+tailwindcss+vite ka basic setup kar liya hai, backend folder ke andar kuch bhi nhi hai sab khaali pada hua hai.**
- ###### **GitHub repo bana li hai jisme frontend ka basic setup jo kara tha uska code puch kardiya hai + netlify pe frontend part ko deploy bhi kar diya hai.**
- ###### **mujhe pura complete frontend + backend ka complete code generate karke doge.**
- ###### **structure bhi bana ke doge ki kon kon si file banegi or kaha banegi.**
- ###### **un sab ko aapas me connect kese karna hai yeh bhi bataoge.**
- ###### **and un sab ko run kese karna hai saath me yeh bhi bataoge.**
- ###### **and backend ko to me render pe to deploy kar dunga but frontend or backend aapas me connect kese honge yeh bhi bataoge.**
- ###### **and at last hostinger se kam se kam price me uska domain kese lunga kese us domain ko render waala domain hata ke purchase waala domain kese attach karunga yeh bhi bataoge.**

### **Proceed with code generation now, with following all instruction carefully.**
