import { subject } from '../observerPattern.js';
import { eventObserversArray } from '../observerModules/observerEvents.js'
import { codeEditorPopup } from '../utils/codeEditor.js';
import { getCurrencyPrice } from '../utils/getCurrencyPrice.js';
import { codeMirror, resetCodeMirror } from '../utils/getCodeMirror.js';

function adsConversionCode() {
    // instanciando o form de Ads Conversion Code
    const formAdsConversionCode = document.querySelector('form#formAdsConversionCode');

    // selecionando as checkboxes disponíveis
    const checkboxUrl = formAdsConversionCode.querySelector('input#enableUrlFilter');
    const checkboxDomContentLoaded = formAdsConversionCode.querySelector('input#enableDomContentLoaded');
    const triggerType = formAdsConversionCode.querySelector('select#triggerType');

    //Seletores de combinação - Select
    const eventTypeSelect = formAdsConversionCode.querySelector('select#eventType');
    const urlTypeSelect = formAdsConversionCode.querySelector('select#urlType');
    const messageTypeSelect = formAdsConversionCode.querySelector('select#messageType');
    const currencyTypeSelect = formAdsConversionCode.querySelector('select#currencyType');
    const typeConversionSelect = formAdsConversionCode.querySelector('select#typeConversion');

    //Seletores de combinação - Inputs
    const urlTextInput = formAdsConversionCode.querySelector('input#urlText');
    const messageTextInput = formAdsConversionCode.querySelector('input#messageText');
    const cssSelectorInput = formAdsConversionCode.querySelector('input#selectorCss');
    const priceSelectorInput = formAdsConversionCode.querySelector('input#priceSelector');
    const orderselectorInput = formAdsConversionCode.querySelector('input#orderSelector');
    const conversionIdInput = formAdsConversionCode.querySelector('input#conversionId');
    const conversionLabelInput = formAdsConversionCode.querySelector('input#conversionLabel');

    // criando um controller interruptor das checkboxes da extensão.
    const checkBoxesController = {
        urlBoxChecked: false,
        domContentLoadedChecked: false,
        triggerType: triggerType.value,
    };

    // função para resetar o formulário após o envio do mesmo.
    const formReset = function() {
        // resetando campos do form
        formAdsConversionCode.reset();

        // zerando controllers dos checkboxes
        checkBoxesController.urlBoxChecked = false;
        checkBoxesController.domContentLoadedChecked = false;

        // desabilitando selects dentro do HTML
        eventTypeSelect.setAttribute('disabled', '');
        urlTypeSelect.setAttribute('disabled', '');
        urlTextInput.setAttribute('disabled', '');
        messageTypeSelect.setAttribute('disabled', '');
        messageTextInput.setAttribute('disabled', '');
        cssSelectorInput.setAttribute('disabled', '');
        priceSelectorInput.setAttribute('disabled', '');
        orderselectorInput.setAttribute('disabled', '');
        currencyTypeSelect.setAttribute('disabled', '');
    }
    
    triggerType.addEventListener('change', function(ev) {
        ev.stopPropagation();

        checkBoxesController.triggerType = triggerType.value;

        if (triggerType.value === 'event' || triggerType.value === 'event-multiple') {
            cssSelectorInput.hasAttribute('disabled') && cssSelectorInput.removeAttribute('disabled');
            eventTypeSelect.hasAttribute('disabled') && eventTypeSelect.removeAttribute('disabled');
            messageTypeSelect.setAttribute('disabled', '');
            messageTextInput.setAttribute('disabled', '');
        }

        if (triggerType.value === 'body-message') {
            messageTypeSelect.hasAttribute('disabled') && messageTypeSelect.removeAttribute('disabled');
            messageTextInput.hasAttribute('disabled') && messageTextInput.removeAttribute('disabled');
            eventTypeSelect.setAttribute('disabled', '');
            cssSelectorInput.setAttribute('disabled', '');
        }
    });

    // evento para capturar mudança no checkbox de DOMContentLoaded
    checkboxDomContentLoaded.addEventListener('change', function (ev) {
        ev.stopPropagation();

        // altera o estado do checkboxes controller definido lá em cima
        checkBoxesController.domContentLoadedChecked = !checkBoxesController.domContentLoadedChecked;
    });

    // evento para capturar mudança no checkbox de URL Filter
    checkboxUrl.addEventListener('change', function (ev) {
        ev.stopPropagation();

        // altera o estado do checkboxes controller definido lá em cima
        checkBoxesController.urlBoxChecked = !checkBoxesController.urlBoxChecked;

        if (!checkBoxesController.urlBoxChecked) {
            // se o checkbox de URL Filter NÃO estiver checado desabilita o select do Tipo de filtro de URL e o input da URL
            urlTypeSelect.setAttribute('disabled', '');
            urlTextInput.setAttribute('disabled', '');
        } else {
            // se o checkbox de URL Filter estiver checado habilita o select do Tipo de filtro de URL e o input da URL
            urlTypeSelect.removeAttribute('disabled');
            urlTextInput.removeAttribute('disabled');
        }
    });

    typeConversionSelect.addEventListener('change', function(ev) {
        const conversionPrice = priceSelectorInput;
        const conversionOid = orderselectorInput;
        const conversionCurrency = currencyTypeSelect;

        if (typeConversionSelect.value === 'purchase') {
            conversionPrice.hasAttribute('disabled') && conversionPrice.removeAttribute('disabled');
            conversionOid.hasAttribute('disabled') && conversionOid.removeAttribute('disabled');
            conversionCurrency.hasAttribute('disabled') && conversionCurrency.removeAttribute('disabled');
        } else {
            !conversionPrice.hasAttribute('disabled') && conversionPrice.setAttribute('disabled', '');
            !conversionOid.hasAttribute('disabled') && conversionOid.setAttribute('disabled', '');
            !conversionCurrency.hasAttribute('disabled') && conversionCurrency.setAttribute('disabled', '');
        }
    });


    // capturando envio do formulário
    formAdsConversionCode.addEventListener('submit', function (ev) {
        // prevenindo comportamento padrão
        ev.preventDefault();

        // criando o Subject para receber os observers
        const subjectOfObservers = subject();

        // capturando os valores dos inputs e selects do DOM
        const htmlElements = {
            selectorInputCss: cssSelectorInput.value,
            urlTypeSelector: urlTypeSelect.value,
            eventTypeSelector: eventTypeSelect.value,
            urlTextSelector: urlTextInput.value,
            messageTypeSelector: messageTypeSelect.value,
            messageTextSelector: messageTextInput.value,
        }

        // inscrevendo todos os observers functions (importados) dentro do subject
        subjectOfObservers.subscribeObserver(...eventObserversArray);

        // notificando todos os observers
        subjectOfObservers.notifyAll(checkBoxesController, codeMirror, htmlElements);

        // checando se os checkboxes de array, eventos e url estão ativos e com seus respectivos inputs preenchidos corretamente. 
        if ((checkBoxesController.eventBoxChecked || checkBoxesController.arrayBoxChecked) && htmlElements.selectorInputCss === '' || checkBoxesController.urlBoxChecked && htmlElements.urlTextSelector === '') {
            alert('Campo de seletor CSS ou de filtro de URL está ou estão vazios, verifique o preenchimento!');
            resetCodeMirror();
            return;
        }

        // fazendo uma identação do código javascript gerado dentro do editor de código
        const beautifiedCode = js_beautify(codeMirror.getValue());

        // setando o código identado dentro do editor novamente
        codeMirror.setValue(`${beautifiedCode.replace(/(\n+)/g, "\n")}`);

        const conversionConfigs = {
            conversionId: conversionIdInput,
            conversionLabel: conversionLabelInput,
        }

        if (!conversionConfigs.conversionId.value || !conversionConfigs.conversionLabel.value) {
            alert('Campo de conversion ID ou conversion label deve estar preenchido!');
            resetCodeMirror();
            return;
        }

        if (typeConversionSelect.value === 'purchase') {
            const conversionPrice = priceSelectorInput.value;
            const conversionOid = orderselectorInput.value;
            const conversionCurrency = currencyTypeSelect.value;

            if (!conversionPrice || !conversionCurrency) {
                alert('Campos de Preço e Currency devem estar preenchidos com os seletores CSS!');
                resetCodeMirror();
                return;
            }

            // colocando comentário no meio do editor de códigos
            codeMirror.replaceRange(`
                gtag('event', 'conversion', {   
                    'send_to': 'AW-${conversionConfigs.conversionId.value}/${conversionConfigs.conversionLabel.value}',
                    'value': ${getCurrencyPrice(conversionCurrency, `document.querySelector('${conversionPrice}').innerText`)},
                    'currency': '${conversionCurrency}',
                    'transaction_id': document.querySelector('${conversionOid}').innerText.replace(/\\D+/g, '')
                })`, {line: (codeMirror.lineCount() / 2) - 1});

            // mostrando janela com o código gerado, identado e editado.
            codeEditorPopup(codeMirror);

            // resetando todo o form para novamente gerar outros códigos;
            formReset();
            return;
        }

        // colocando comentário no meio do editor de códigos
        codeMirror.replaceRange(`
            gtag('event', 'conversion', {   
                'send_to': 'AW-${conversionConfigs.conversionId.value}/${conversionConfigs.conversionLabel.value}',
            });`, {line: (codeMirror.lineCount() / 2) - 1});

        // deixando codigo mais bonito
        const allCode = js_beautify(codeMirror.getValue());

        // setando o codigo bonito
        codeMirror.setValue(`<script>\n${allCode}\n</script>`);

        // mostrando janela com o código gerado, identado e editado.
        codeEditorPopup(codeMirror);

        // resetando todo o form para novamente gerar outros códigos;
        formReset();
        return;
    });
}

export { adsConversionCode }