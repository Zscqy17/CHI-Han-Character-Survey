import {createRoot} from 'react-dom/client';
import Atlas from '../app/atlas';
createRoot(document.getElementById('root')!).render(<Atlas offline includedPdfs={process.env.ATLAS_INCLUDE_PDFS==='true'}/>);
