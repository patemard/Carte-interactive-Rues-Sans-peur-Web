

export class Constants  {
    QUEBEC_CITY: any = {latitude: 46.813877, longitude: -71.207977};
    QUEBEC: any = {latitude: 52.476089, longitude:  -71.825867};
    QUEBEC_BOUNDING_BOX =  [-72.638426, 45.538850, -69.505885, 48.216402];


   loremIpsum = " Lorem ipsum dolor sit amet, consectetur adipiscing elit. "+
     "Aliquam vitae eros sit amet dolor cursus fringilla at a neque. Phasellus "+
     " malesuada enim ipsum, quis pharetra lorem accumsan at. Etiam suscipit lorem" +
     " sed erat ultricies, ut pharetra sapien molestie. Sed a posuere orci, ut interdum "+
     " nulla. Cras consequat purus mattis sem congue, a lacinia nibh pellentesque. Aliquam "+
     "erat volutpat. Suspendisse quam nulla, ultrices non euismod eu, gravida eget massa. "+
      " Nunc at purus mattis, iaculis tellus a, feugiat magna. Pellentesque cursus purus vitae" +
      "ante dignissim ullamcorper. Mauris fringilla feugiat tristique. Cras tempus vestibulum quam "+
      "sit amet convallis. Nunc venenatis sollicitudin ultricies. Quisque pharetra tempor dapibus";



    shortLoremIpsum = " Lorem ipsum dolor sit amet, consectetur adipiscing elit. "+
      "Aliquam vitae eros sit amet dolor cursus fringilla at a neque. Phasellus "+
      " malesuada enim ipsum, quis pharetra lorem accumsan at. Etiam suscipit lorem" +
      " sed erat ultricies, ut pharetra sapien molestie. Sed a posuere orci, ut interdum ";


    emotions: {name: string, icon: string, class?: string, rgb: { point: string, card: string, highlight: string,trajectory: string }, png: string}[] = [
          { name: "Sécurisant", icon: "smile-o", class: "text-violet-pale-atv",
            rgb: {point:"rgba(71, 166, 255, 0.9)", card: "rgba(71, 166, 255, 0.95)", highlight: "rgba(71, 166, 255, 1)", trajectory: "rgba(71, 166, 255, 0.8)" }, png: "black"},
          { name: "Insécurisant", icon: "frown-o" , class: "text-bleu-atv",
            rgb: {point: "rgba(119, 112, 237, 0.9)", card:"rgba(119, 112, 237, 0.95)", highlight: "rgba(52,41,121, 1)", trajectory: "rgba(119, 112, 237, 0.8)"}, png: "red"}
    ]

    transports = [
        { name: "Marche", icon: "../../assets/png/pieton.png"},
        { name: "Vélo ", icon: "../../assets/png/velo.png"},
        { name: "Bus ", icon: "../../assets/png/Bus.png" },
        { name: "Voiture ", icon: "../../assets/png/auto.png"},
    ]

    types = [
      {name: "Point", icon: "map-marker"},
      {name: "Trajectoire", icon: "map-o"}
    ]

    categories = [
      {name: "Témoignage"},
      {name: "Lieu"},
    ]



}
