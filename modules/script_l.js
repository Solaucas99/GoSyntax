import { tabsController } from './tabsController.js';
import { openDocumentation } from './utils/openDocumentation.js';
import { adsConversionCode } from './forms/adsConversionCode.js';
import { analyticsEvent } from './forms/analyticsEvent.js';
import { dataLayer } from './forms/dataLayer.js';
import { enhancedConversions } from './forms/enhancedConversions.js';




// função master de execução do código
function execute() {
    // iniciando o controller das tabs
    tabsController();

    // iniciando o controller de documentação JS
    openDocumentation();

    // iniciando form de ads conversion code
    adsConversionCode();

    //iniciando form de analytics event
    analyticsEvent();

    //iniciando form de dataLayer
    dataLayer();
    
    //iniciando form de enhancedConversions
    enhancedConversions();
}

export { execute };