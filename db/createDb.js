use EasyRash

db.createCollection("events");
db.createCollection("users");

db.users.insert([
  {
    "_id":  "Jessica Jones <jessica.jones@alias.com>",
    "given_name": "Jessica",
    "family_name": "Jones",
    "email": "jessica.jones@alias.com",
    "pass": "jessica.jones",
    "sex": "female",
    "confirmed": true
  },
  {
    "_id":  "Vanessa Ives <vanessa.ives@hell.com>",
    "given_name": "Vanessa",
    "family_name": "Ives",
    "email": "vanessa.ives@hell.com",
    "pass": "vanessa.ives",
    "sex": "female",
    "confirmed": true
  },
  {
    "_id":  "Lyra Belacqua <lyra.belacqua@ox.com>",
    "given_name": "Lyra",
    "family_name": "Belacqua",
    "email": "lyra.belacqua@ox.com",
    "pass": "lyra.belacqua",
    "sex": "female",
    "confirmed": true
  },
  {
    "_id": "Alice Liddell <alice.liddell@whiterabbit.com>",
    "given_name": "Alice",
    "family_name": "Liddell",
    "email": "alice.liddell@whiterabbit.com",
    "pass": "alice.liddell",
    "sex": "female",
    "confirmed": true
  },
  {
    "_id": "Arthur Dent <arthur.dent@fish.com>",
    "given_name": "Arthur",
    "family_name": "Dent",
    "email": "arthur.dent@fish.com",
    "pass": "arthur.dent",
    "sex": "male",
    "confirmed": true
  },
  {
    "_id": "Arabella Strange <arabella.strange@york.com>",
    "given_name": "Arabella",
    "family_name": "Strange",
    "email": "arabella.strange@york.com",
    "pass": "arabella.strange",
    "sex": "female",
    "confirmed": true
  },
  {
    "_id": "John Constantine <john.constantine@hell.com>",
    "given_name": "John",
    "family_name": "Constantine",
    "email": "john.constantine@hell.com",
    "pass": "john.constantine",
    "sex": "male",
    "confirmed": true
  },
  {
    "_id": "Fabio Vitali <fabio.vitali@unibo.it>",
    "given_name": "Fabio",
    "family_name": "Vitali",
    "email": "fabio.vitali@unibo.it",
    "pass": "fabio.vitali",
    "sex": "male",
    "confirmed": true
  },
  {
    "_id": "Angelo Di Iorio <angelo.diiorio@unibo.it>",
    "given_name": "Angelo",
    "family_name": "Di Iorio",
    "email": "angelo.diiorio@unibo.it",
    "pass": "angelo.diiorio",
    "sex": "male",
    "confirmed": true
  },
  {
    "_id": "Silvio Peroni <silvio.peroni@unibo.it>",
    "given_name": "Silvio",
    "family_name": "Peroni",
    "email": "silvio.peroni@unibo.it",
    "pass": "silvio.peroni",
    "sex": "male",
    "confirmed": true
  },
  {
    "_id":  "Alejandra Gonzalez-Beltran <alejandra.gonzalezbeltran@example.com>",
    "given_name": "Alejandra",
    "family_name": "Gonzalez-Beltran",
    "email":"alejandra.gonzalezbeltran@example.com",
    "pass": "alejandra.gonzalezbeltran",
    "sex": "female",
    "confirmed": true
  },
  {
    "_id": "Alessia Bardi <alessia.bardi@example.com>",
    "given_name": "Alessia",
    "family_name": "Bardi",
    "email":"alessia.bardi@example.com",
    "pass": "alessia.bardi",
    "sex": "female",
    "confirmed": true
  },
  {
    "_id": "Alex Wade <alex.wade@example.com>",
    "given_name": "Alex",
    "family_name": "Wade",
    "email":"alex.wade@example.com",
    "pass": "alex.wade",
    "sex": "male",
    "confirmed": true
  },
  {
    "_id": "Anastasia Dimou <anastasia.dimou@example.com>",
    "given_name": "Anastasia",
    "family_name": "Dimou",
    "email":"anastasia.dimou@example.com",
    "pass": "anastasia.dimou",
    "sex": "female",
    "confirmed": true
  },
  {
    "_id":  "Andrea Nuzzolese <andrea.nuzzolese@example.com>",
    "given_name": "Andrea",
    "family_name": "Nuzzolese",
    "email":"andrea.nuzzolese@example.com",
    "pass": "andrea.nuzzolese",
    "sex": "male",
    "confirmed": true
  },
  {
    "_id": "Francesco Osborne <francesco.osborne@example.com>",
    "given_name": "Francesco",
    "family_name": "Osborne",
    "email":"francesco.osborne@example.com",
    "pass": "francesco.osborne",
    "sex": "male",
    "confirmed": true
  },
  {
    "_id": "Francesco Poggi <francesco.poggi5@unibo.it>",
    "given_name": "Francesco",
    "family_name": "Poggi",
    "email":"francesco.poggi5@unibo.it",
    "pass": "francesco.poggi5",
    "sex": "male",
    "confirmed": true
  },
  {
    "_id": "Jun Zhao <j.zhao5@example.com>",
    "given_name": "Jun",
    "family_name": "Zhao",
    "email":"j.zhao5@example.com",
    "pass": "j.zhao5",
    "sex": "female",
    "confirmed": true
  },
  {
    "_id": "Christoph Lange <math.semantic.web@example.com>",
    "given_name": "Christoph",
    "family_name": "Lange",
    "email":"math.semantic.web@example.com",
    "pass": "math.semantic.web",
    "sex": "male",
    "confirmed": true
  },
  {
    "_id":  "Michael Smith <mike@example.com>",
    "given_name": "Michael",
    "family_name": "Smith",
    "email":"mike@example.com",
    "pass": "mike",
    "sex": "male",
    "confirmed": true
  },
  {
    "_id": "Paul Groth <p.groth@example.com>",
    "given_name": "Paul",
    "family_name": "Groth",
    "email":"p.groth@example.com",
    "pass": "p.groth",
    "sex": "male",
    "confirmed": true
  },
  {
    "_id": "Paolo Ciancarini <paolo.ciancarini@example.com>",
    "given_name": "Paolo",
    "family_name": "Ciancarini",
    "email":"paolo.ciancarini@example.com",
    "pass": "paolo.ciancarini",
    "sex": "male",
    "confirmed": true
  },
  {
    "_id": "Paolo Manghi <paolo.manghi@example.com>",
    "given_name": "Paolo",
    "family_name": "Manghi",
    "email":"paolo.manghi@example.com",
    "pass": "paolo.manghi",
    "sex": "male",
    "confirmed": true
  },
  {
    "_id": "Raffaele Giannella <raffaele.giannella@example.com>",
    "given_name": "Raffaele",
    "family_name": "Giannella",
    "email":"raffaele.giannella@example.com",
    "pass": "raffaele.giannella",
    "sex": "male",
    "confirmed": true
  },
  {
    "_id": "Tobias Kuhn <tokuhn@example.com>",
    "given_name": "Tobias",
    "family_name": "Kuhn",
    "email":"tokuhn@example.com",
    "pass": "tokuhn",
    "sex": "male",
    "confirmed": true
  },
  {
    "_id": "Sahar Vahdati <vahdati@example.com>",
    "given_name": "Sahar",
    "family_name": "Vahdati",
    "email":"vahdati@example.com",
    "pass": "vahdati",
    "sex": "female",
    "confirmed": true
  }
]);

db.events.insert([
  {
    "conference": "International Web Comics Conference 2016",
    "acronym": "IWCC 2016",
    "chairs": [
      "Jessica Jones <jessica.jones@alias.com>",
      "Vanessa Ives <vanessa.ives@hell.com>",
      "Fabio Vitali <fabio.vitali@unibo.it>"
    ],
    "pc_members": [
      "Silvio Peroni <silvio.peroni@unibo.it>",
      "Angelo Di Iorio <angelo.diiorio@unibo.it>",
      "Lyra Belacqua <lyra.belacqua@ox.com>",
      "Alice Liddell <alice.liddell@whiterabbit.com>",
      "Arthur Dent <arthur.dent@fish.com>",
      "Arabella Strange <arabella.strange@york.com>",
      "John Constantine <john.constantine@hell.com>"
    ],
    "submissions": [
      {
        "title": "The Microsoft Academic Graph: New Applications and Research Opportunities -- SAVE-SD 2016 Keynote Talk",
        "authors": [
          "Alex Wade <alex.wade@example.com>"
        ],
        "url": "wade-savesd2016.html",
        "reviewers": [
          "Silvio Peroni <silvio.peroni@unibo.it>",
          "Angelo Di Iorio <angelo.diiorio@unibo.it>"
        ]
      },
      {
        "title": "Semantic Publishing Challenge: Bootstrapping a Value Chain for Scientific Data ",
        "authors": [
          "Sahar Vahdati <vahdati@example.com>",
          "Anastasia Dimou <anastasia.dimou@example.com>",
          "Christoph Lange <math.semantic.web@example.com>",
          "Angelo Di Iorio <angelo.diiorio@unibo.it>"
        ],
        "url": "vahdati-savesd2016.html",
        "reviewers": [
          "Alice Liddell <alice.liddell@whiterabbit.com>",
          "Arthur Dent <arthur.dent@fish.com>"
        ]
      },
      {
        "title": "It ROCS! -- The RASH Online Conversion Service",
        "authors": [
          "Angelo Di Iorio <angelo.diiorio@unibo.it>",
          "Alejandra Gonzalez-Beltran <alejandra.gonzalezbeltran@example.com>",
          "Francesco Osborne <francesco.osborne@example.com>",
          "Silvio Peroni <silvio.peroni@unibo.it>",
          "Francesco Poggi <francesco.poggi5@unibo.it>",
          "Fabio Vitali <fabio.vitali@unibo.it>"
        ],
        "url": "diiorio-www2016.html",
        "reviewers": [
          "Arabella Strange <arabella.strange@york.com>",
          "John Constantine <john.constantine@hell.com>"
        ]
      },
      {
        "title": "RASH: Research Articles in Simplified HTML -- Documentation - Version 0.5, February 15, 2016",
        "authors": [
          "Silvio Peroni <silvio.peroni@unibo.it>"
        ],
        "url": "peroni-rashdoc2016.html",
        "reviewers": [
          "Lyra Belacqua <lyra.belacqua@ox.com>",
          "Arthur Dent <arthur.dent@fish.com>"
        ]
      },
      {
        "title": "Science Bots: A Model for the Future of Scientific Computation?",
        "authors": [
          "Tobias Kuhn <tokuhn@example.com>"
        ],
        "url": "tuhn-savesd2015.html",
        "reviewers": [
          "Silvio Peroni <silvio.peroni@unibo.it>",
          "Arabella Strange <arabella.strange@york.com>"
        ]
      }
    ]
  },
  {
    "conference": "International Great Books Conference 2016",
    "acronym": "IGBC 2016",
    "chairs": [
      "Arabella Strange <arabella.strange@york.com>",
      "John Constantine <john.constantine@hell.com>"
    ],
    "pc_members": [
      "Jessica Jones <jessica.jones@alias.com>",
      "Vanessa Ives <vanessa.ives@hell.com>",
      "Lyra Belacqua <lyra.belacqua@ox.com>",
      "Alice Liddell <alice.liddell@whiterabbit.com>",
      "Arthur Dent <arthur.dent@fish.com>",
      "Arabella Strange <arabella.strange@york.com>",
      "John Constantine <john.constantine@hell.com>"
    ],
    "submissions": [
      {
        "title": "Increasing the Productivity of Scholarship: The Case for Knowledge Graphs -- SAVE-SD 2015 Keynote Talk",
        "authors": [
          "Paul Groth <p.groth@example.com>"
        ],
        "url": "groth-savesd2015.html",
        "reviewers": [
          "Vanessa Ives <vanessa.ives@hell.com>",
          "Lyra Belacqua <lyra.belacqua@ox.com>"
        ]
      },
      {
        "title": "Exploring bibliographies for research-related tasks",
        "authors": [
          "Angelo Di Iorio <angelo.diiorio@unibo.it>",
          "Raffaele Giannella <raffaele.giannella@example.com>",
          "Francesco Poggi <francesco.poggi5@unibo.it>",
          "Fabio Vitali <fabio.vitali@unibo.it>"
        ],
        "url": "diiorio-savesd2015.html",
        "reviewers": [
          "Arthur Dent <arthur.dent@fish.com>",
          "Arabella Strange <arabella.strange@york.com>",
          "John Constantine <john.constantine@hell.com>"
        ]
      },
      {
        "title": "The RASH Framework: enabling HTML+RDF submissions in scholarly venues",
        "authors": [
          "Angelo Di Iorio <angelo.diiorio@unibo.it>",
          "Andrea Giovanni Nuzzolese <andrea.nuzzolese@example.com>",
          "Francesco Osborne <francesco.osborne@example.com>",
          "Silvio Peroni <silvio.peroni@unibo.it>",
          "Francesco Poggi <francesco.poggi5@unibo.it>",
          "Michael Smith <mike@example.com>",
          "Fabio Vitali <fabio.vitali@unibo.it>",
          "Jun Zhao <j.zhao5@example.com>"
        ],
        "url": "diiorio-iswc2015.html",
        "reviewers": [
          "Jessica Jones <jessica.jones@alias.com>",
          "Vanessa Ives <vanessa.ives@hell.com>"
        ]
      },
      {
        "title": "Evaluating citation functions in CiTO: cognitive issues -- Preprint of http://dx.doi.org/10.1007/978-3-319-07443-6_39",
        "authors": [
          "Paolo Ciancarini <paolo.ciancarini@example.com>",
          "Angelo Di Iorio <angelo.diiorio@unibo.it>",
          "Andrea Nuzzolese <andrea.nuzzolese@example.com>",
          "Silvio Peroni <silvio.peroni@unibo.it>",
          "Fabio Vitali <fabio.vitali@unibo.it>"
        ],
        "url": "ciancarini-eswc2014.html",
        "reviewers": [
          "Jessica Jones <jessica.jones@alias.com>",
          "John Constantine <john.constantine@hell.com>"
        ]
      },
      {
        "title": "Enhanced Publication Management Systems -- A systemic approach towards modern scientific communication",
        "authors": [
          "Alessia Bardi <alessia.bardi@example.com>",
          "Paolo Manghi <paolo.manghi@example.com>"
        ],
        "url": "bardi-savesd2015.html",
        "reviewers": [
          "Vanessa Ives <vanessa.ives@hell.com>",
          "Arabella Strange <arabella.strange@york.com>"
        ]
      }
    ]
  }
]);
