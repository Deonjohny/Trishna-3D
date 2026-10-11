import type { Room } from '../types/building';

const FT=.3048;
function room(id:string,name:string,floor:0|1,w:number,d:number,material:string,color:string,bounds:{x:number;z:number;w:number;d:number},kind?:Room['kind']):Room{
 return {id,name,floor,w,d,material,color,bounds,kind,x:(bounds.x+bounds.w/2-13)*FT,z:(16-bounds.z-bounds.d/2)*FT};
}

// Ground-floor starter plan: the room schedule and connected model bounds match exactly.
// Upper floors are intentionally left undecided and can be added in later plan sheets.
export const sampleRooms:Room[]=[
 // Reproducible 3-column × 4-row grid: 8+10+8 ft by 5+7+10+10 ft.
 room('sitout','Front Sitout',0,8,5,'Stone','#c9bca6',{x:0,z:0,w:8,d:5},'outdoor'),
 room('puja','Puja Room',0,10,5,'Marble','#d6b96e',{x:8,z:0,w:10,d:5}),
 room('passage','Passage',0,8,5,'Marble','#bcb9ae',{x:18,z:0,w:8,d:5},'passage'),
 room('dining','Dining',0,8,7,'Teak','#bc8b57',{x:0,z:5,w:8,d:7}),
 room('kitchen','Kitchen',0,10,7,'Ceramic','#9cb9b0',{x:8,z:5,w:10,d:7}),
 room('bath','Bath / WC',0,8,7,'Tile','#88aeb3',{x:18,z:5,w:8,d:7}),
 room('living','Living',0,8,10,'Marble','#d8c9ad',{x:0,z:12,w:8,d:10}),
 room('bed1','Bedroom 1',0,10,10,'Teak','#bd9c79',{x:8,z:12,w:10,d:10}),
 room('bed2','Bedroom 2',0,8,10,'Carpet','#9eaa9d',{x:18,z:12,w:8,d:10}),
 room('stair','Central Staircase',0,8,10,'Teak','#9e7047',{x:0,z:22,w:8,d:10},'stair'),
 room('bed3','Bedroom 3',0,10,10,'Teak','#c1a17d',{x:8,z:22,w:10,d:10}),
 room('lounge','Family Lounge',0,8,10,'Marble','#c4b69c',{x:18,z:22,w:8,d:10}),
];
