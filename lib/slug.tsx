"use client";
import { useState } from "react"; import Image,{type ImageProps}from "next/image";
const A:Record<string,string>={"Jollof Rice":"/crops/rice.webp","Jollof Rice & Chicken":"/crops/chicken.webp","Jollof Rice & Fish":"/media/jollof-poster.jpg","Fried Chicken":"/crops/chicken.webp","Fried Fish":"/crops/fish.webp","Fried Plantain":"/crops/plantain.webp","Coleslaw":"/crops/coleslaw.webp"};
export function slugify(n:string){return n.toLowerCase().replace(/^4\b/,"four").replace(/&|\band\b/g," and ").replace(/[^a-z0-9]+/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"")};export function imageFor(n:string):string|null{return A[n]??null}export function FoodImage(p:ImageProps){const[f,s]=useState(false);return <Image {...p} src={f?"/images/placeholder.jpg":p.src} onError={()=>s(true)}/>}
