// The 11 West Fraser products in the house, in build order (sidebar order).
// `id` matches `wf_product` on the model's parts (public/framed-house.glb); `url` is the
// "Learn More" link. Copy stays factual: product families from westfraser.com/products and
// osb.westfraser.com.
const LUMBER = 'https://www.westfraser.com/products/lumber';

export const products = [
  {
    id: 'rim',
    name: 'Rimboard',
    type: 'OSB',
    color: '#b68b4d',
    url: 'https://osb.westfraser.com/sub-floor/rimboard/',
    desc: 'Rimboard is a precision-engineered OSB product for use as a perimeter board for floor and roof joists in residential and light commercial construction.',
  },
  {
    id: 'webstock',
    name: 'I-joists',
    type: 'OSB',
    color: '#a9854f',
    url: 'https://www.westfraser.com/products/osb',
    desc: 'The OSB web forms the central section of an engineered I-joist. Lumber flanges and panel webs work together in the floor assembly.',
  },
  {
    id: 'joists',
    name: 'Floor joists',
    type: 'LUMBER',
    color: '#c99f68',
    url: LUMBER,
    desc: 'Dimensional lumber joists span between supports to carry the floor above. Here they frame the floors of the front bump-out.',
  },
  {
    id: 'subfloor',
    name: 'Subfloor',
    type: 'OSB',
    color: '#dac397',
    url: 'https://osb.westfraser.com/sub-floor/',
    desc: "OSB panels form a continuous floor over the joists. West Fraser's OSB is a strong, durable option for residential and commercial construction.",
  },
  {
    id: 'plates',
    name: 'Framing lumber – plates',
    type: 'LUMBER',
    color: '#ba9360',
    url: LUMBER,
    desc: "Horizontal lumber plates tie wall studs to the floor and the tops of framed walls together. West Fraser's softwood lumber is valued for its strength, durability and renewable nature.",
  },
  {
    id: 'studs',
    name: 'Framing lumber – studs',
    type: 'LUMBER',
    color: '#ddba81',
    url: LUMBER,
    desc: 'Vertical studs form the skeleton of every wall. Softwood lumber is an essential component in structural framework.',
  },
  {
    id: 'lvl',
    name: 'LVL',
    type: 'LVL',
    color: '#c9a646',
    url: 'https://www.westfraser.com/products/lvl',
    desc: 'LVL headers and beams span openings such as windows, doors and the open garage. LVL beams and headers support heavier loads and span greater distances than dimensional lumber.',
  },
  {
    id: 'owt',
    name: 'Open web trusses',
    type: 'LUMBER',
    color: '#d8b47c',
    url: LUMBER,
    desc: 'Open web floor trusses are built from lumber chords and webs joined with metal plates. The open webs leave room to run services through the floor.',
  },
  {
    id: 'trusses',
    name: 'Roof trusses & rafters',
    type: 'LUMBER',
    color: '#e7c992',
    url: LUMBER,
    desc: "Triangulated lumber members form the roof structure and support the roof sheathing. West Fraser's softwood lumber is used in structural framework and trusses.",
  },
  {
    id: 'wallsheathing',
    name: 'Wall sheathing',
    type: 'OSB',
    color: '#c5a36a',
    url: 'https://osb.westfraser.com/wall-sheathing/',
    desc: 'OSB panels sheath the wall frame, adding resistance to wind and earthquake loads and forming an integral part of the building envelope.',
  },
  {
    id: 'roofsheathing',
    name: 'Roof sheathing',
    type: 'PLYWOOD',
    color: '#e5cfa4',
    url: 'https://www.westfraser.com/products/plywood',
    desc: 'Plywood panels span the roof trusses to create a continuous deck for the roofing and form part of the building envelope.',
  },
];
