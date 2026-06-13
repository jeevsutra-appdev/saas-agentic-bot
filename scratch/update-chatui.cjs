const fs = require('fs');
const path = 'c:/App developement/Demo apps for clients/saas Agentic bot/apps/web/app/b/[tenant]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('import ChatWidgetUI')) {
  content = content.replace(
    /import \{ motion, AnimatePresence \} from "framer-motion";/,
    'import { motion, AnimatePresence } from "framer-motion";\nimport ChatWidgetUI from "@/components/ChatWidgetUI";'
  );
}

const replacement = `          <div className="flex-1 w-full relative h-full flex flex-col">
             <div className="absolute top-4 right-4 z-50">
               <button type="button" onClick={() => setIsChatOpen(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur transition shadow-md cursor-pointer">
                 <X className="h-5 w-5 text-white" />
               </button>
             </div>
             <ChatWidgetUI 
                tenantSlug={tenantSlug} 
                agentConfig={storeData.assignedAgent} 
                isPreviewMode={false} 
                overrideAgentId={storeData.assignedAgent?.id || storeData.storefront?.assignedAgentId} 
             />
          </div>`;

content = content.replace(
  /\{\/\* Grab bar \*\/\}[\s\S]*?\{\/\* Input Bar \*\/\}[\s\S]*?<\/form>\s*<\/div>/,
  replacement
);

fs.writeFileSync(path, content);
console.log('Chat UI updated.');
