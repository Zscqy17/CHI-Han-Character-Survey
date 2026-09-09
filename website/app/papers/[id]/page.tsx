import Atlas from '../../atlas';
import papers from '@/data/papers.json';
export function generateStaticParams(){return papers.map(p=>({id:p.id}));}
export default async function PaperPage({params}:{params:Promise<{id:string}>}){const {id}=await params;return <Atlas initialPaperId={id}/>;}
