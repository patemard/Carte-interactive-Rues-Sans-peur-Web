

export class Constants  {
    QUEBEC_CITY: any = {latitude: 46.813877, longitude: -71.207977};
    QUEBEC: any = {latitude: 52.476089, longitude:  -71.825867};
    QUEBEC_BOUNDING_BOX = '-71.45,46.75,-71.15,46.95';


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


  emotions: {name: string, icon: string, class?: string, rgb: { point: string, card: string, highlight: string }, png: string}[] = [
        { name: "Sécurisant", icon: "smile-o", class: "text-success", 
          rgb: {point:"rgba(40, 167, 69, 0.6)", card: "rgba(40, 167, 69, 0.8)", highlight: "rgba(40, 167, 69, 0.95)" }, png: "black"},
        { name: "Insécurisant", icon: "frown-o" , class: "text-danger", 
          rgb: {point: "rgba(220, 53, 69, 0.6)", card:"rgba(220, 53, 69, 0.8)", highlight: "rgba(220, 53, 69, 0.95)"}, png: "red"}
  ]
    
  transports = [
      { name: "Marche", icon: "person-walking"},
      { name: "Vélo ", icon: "bicycle"},
      { name: "Bus ", icon: "bus" },
      { name: "Voiture ", icon: "car"},
  ]

  types = [
    {name: "Point", icon: "map-marker"},
    {name: "Trajectoire", icon: "map-o"}
  ]


}
