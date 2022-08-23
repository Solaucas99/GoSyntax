import { subject } from '../observerPattern.js';
import { eventObserversArray } from '../observerModules/observerEvents.js';
import { eventObserversECArray } from '../observerModules/observerEventsEC.js';
import { codeEditorPopup } from '../utils/codeEditor.js';
import { codeMirror, resetCodeMirror } from '../utils/getCodeMirror.js';

function enhancedConversions() {
    // instanciando o form de Ads Conversion Code
    const formEnhancedConversions = document.querySelector('form#formEnhancedConversions');

    // selecionando as checkboxes disponíveis
    const checkboxUrl = formEnhancedConversions.querySelector('input#enableUrlFilter');
    const checkboxUrlEC = formEnhancedConversions.querySelector('input#enableUrlFilterEC');
    const triggerType = formEnhancedConversions.querySelector('select#triggerType');

    //Seletores de combinação - Select
    const eventTypeSelect = formEnhancedConversions.querySelector('select#eventType');
    const urlTypeSelect = formEnhancedConversions.querySelector('select#urlType');
    const messageTypeSelect = formEnhancedConversions.querySelector('select#messageType');
    const currencyTypeSelect = formEnhancedConversions.querySelector('select#currencyType');
    const urlTypeECSelect = formEnhancedConversions.querySelector('select#urlTypeEC');
    const typeConversionSelect = formEnhancedConversions.querySelector('select#enhancedConversionType');

    //Seletores de combinação - Inputs
    const urlTextInput = formEnhancedConversions.querySelector('input#urlText');
    const messageTextInput = formEnhancedConversions.querySelector('input#messageText');
    const cssSelectorInput = formEnhancedConversions.querySelector('input#selectorCss');
    const priceSelectorInput = formEnhancedConversions.querySelector('input#priceSelector');
    const orderselectorInput = formEnhancedConversions.querySelector('input#orderSelector');
    const urlTextECInput = formEnhancedConversions.querySelector('input#urlTextEC');
    const ECMailInput = formEnhancedConversions.querySelector('input#ECMail');
    const ECPhoneInput = formEnhancedConversions.querySelector('input#ECPhone');
    const ECAreaInput = formEnhancedConversions.querySelector('input#ECArea');


    // criando um controller interruptor das checkboxes da extensão.
    const checkBoxesController = {
        urlBoxChecked: false,
        urlBoxCheckedEC: false,
    };

    // função para resetar o formulário após o envio do mesmo.
    const formReset = function() {
        // resetando campos do form
        formEnhancedConversions.reset();

        // zerando controllers dos checkboxes
        checkBoxesController.urlBoxChecked = false;
        checkBoxesController.urlBoxCheckedEC = false;

        // desabilitando selects dentro do HTML
        eventTypeSelect.setAttribute('disabled', '');
        urlTypeSelect.setAttribute('disabled', '');
        urlTextInput.setAttribute('disabled', '');
        messageTypeSelect.setAttribute('disabled', '');
        messageTextInput.setAttribute('disabled', '');
        cssSelectorInput.setAttribute('disabled', '');
        urlTypeECSelect.setAttribute('disabled', '');
        urlTextECInput.setAttribute('disabled', '');
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

    
    // evento para capturar mudança no checkbox de URL Filter  - Enhanced Conversions
    checkboxUrlEC.addEventListener('change', function (ev) {
        ev.stopPropagation();

        // altera o estado do checkboxes controller definido lá em cima
        checkBoxesController.urlBoxCheckedEC = !checkBoxesController.urlBoxCheckedEC;

        if (!checkBoxesController.urlBoxCheckedEC) {
            // se o checkbox de URL Filter NÃO estiver checado desabilita o select do Tipo de filtro de URL e o input da URL
            urlTypeECSelect.setAttribute('disabled', '');
            urlTextECInput.setAttribute('disabled', '');
        } else {
            // se o checkbox de URL Filter estiver checado habilita o select do Tipo de filtro de URL e o input da URL
            urlTypeECSelect.removeAttribute('disabled');
            urlTextECInput.removeAttribute('disabled');
        }
    });

    typeConversionSelect.addEventListener('change', function(ev) {
        const conversionPrice = priceSelectorInput;
        const conversionOid = orderselectorInput;
        const conversionCurrency = currencyTypeSelect;

        if (typeConversionSelect.value.includes('purchase')) {
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
    formEnhancedConversions.addEventListener('submit', function (ev) {
        // prevenindo comportamento padrão
        ev.preventDefault();

        // criando o Subject para receber os observers
        const subjectOfObservers = subject();
        const subjectOfObserversEC = subject();

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

        const ec_type = typeConversionSelect.value;

        if (ec_type === 'form') {
            let valueString = `
                dataLayer.push({
                    event: 'enhanced_conversion_form',
                    ec_data: {
                        email: localStorage.getItem('ec_email');
                    }
                });
            `;

            if (ECPhoneInput.value) {
                valueString = `
                    dataLayer.push({
                        event: 'enhanced_conversion_form',
                        ec_data: {
                            email: localStorage.getItem('ec_email');
                            phone: localStorage.getItem('ec_phone');
                        }
                    });
                `
            }

            // colocando comentário no meio do editor de códigos
            codeMirror.replaceRange(js_beautify(valueString), {line: (codeMirror.lineCount() / 2) - 1});
        }

        if (ec_type === 'form-purchase') {
            const conversionPrice = priceSelectorInput.value;
            const conversionOid = orderselectorInput.value;
            const conversionCurrency = currencyTypeSelect.value;

            if (!conversionPrice || !conversionCurrency) {
                alert('Campos de Preço e Currency devem estar preenchidos com os seletores CSS!');
                resetCodeMirror();
                return;
            }

            if (conversionCurrency === 'BRL') {
                let valueString = `
                    dataLayer.push({
                        event: 'enhanced_conversion_purchase',
                        ec_data: {
                            email: localStorage.getItem('ec_email'),
                        },
                        purchase_data: {
                            value: document.querySelector('${conversionPrice}').innerText.replace('R$', '').replace('.', '').replace(',', '.'),
                            transaction_id: ${conversionOid ? `document.querySelector('${conversionOid}').innerText` : '""'},
                            currency: '${conversionCurrency}',
                        }
                    });
                `

                if (ECPhoneInput.value) {
                    valueString = `
                        dataLayer.push({
                            event: 'enhanced_conversion_purchase',
                            ec_data: {
                                email: localStorage.getItem('ec_email'),
                                phone: localStorage.getItem('ec_phone'),
                            },
                            purchase_data: {
                                value: document.querySelector('${conversionPrice}').innerText.replace('R$', '').replace('.', '').replace(',', '.'),
                                transaction_id: ${conversionOid ? `document.querySelector('${conversionOid}').innerText` : '""'},
                                currency: '${conversionCurrency}',
                            }
                        });
                    `
                }

                // colocando comentário no meio do editor de códigos
                codeMirror.replaceRange(js_beautify(valueString), {line: (codeMirror.lineCount() / 2) - 1});
            }

            if (conversionCurrency === 'USD') {
                let valueString = `
                    dataLayer.push({
                        event: 'enhanced_conversion_purchase',
                        ec_data: {
                            email: localStorage.getItem('ec_email'),
                        },
                        purchase_data: {
                            value: document.querySelector('${conversionPrice}').innerText.replace('$', '').replace(',', ''),
                            transaction_id: ${conversionOid ? `document.querySelector('${conversionOid}').innerText` : '""'},
                            currency: '${conversionCurrency}',
                        }
                    });
                `

                if (ECPhoneInput.value) {
                    valueString = `
                        dataLayer.push({
                            event: 'enhanced_conversion_purchase',
                            ec_data: {
                                email: localStorage.getItem('ec_email'),
                                phone: localStorage.getItem('ec_phone')
                            },
                            purchase_data: {
                                value: document.querySelector('${conversionPrice}').innerText.replace('$', '').replace(',', ''),
                                transaction_id: ${conversionOid ? `document.querySelector('${conversionOid}').innerText` : '""'},
                                currency: '${conversionCurrency}',
                            }
                        });
                    `
                }

                // colocando comentário no meio do editor de códigos
                codeMirror.replaceRange(js_beautify(valueString), {line: (codeMirror.lineCount() / 2) - 1});
            }
        }


        const newMirror = CodeMirror(document.querySelector('#root2'), {
            lineNumbers: true,
            tabSize: 2,
            mode: 'javascript',
            readOnly: false,
            autoRefresh:true,
            lineWrapping: false,
            // adicionando 15 linhas em branco pra poder "alterá-las depois"
            value: "\n".repeat(15)
        });

        const htmlElementsEC = {
            urlTypeECSelector: urlTypeECSelect.value,
            urlTextECSelector: urlTextECInput.value,
            enhancedConversionTypeSelector: typeConversionSelect.value,
            emailValue: ECMailInput.value,
            phoneValue: ECPhoneInput.value,
            areaValue: ECAreaInput.value,
        }
        
        subjectOfObserversEC.subscribeObserver(...eventObserversECArray);
        subjectOfObserversEC.notifyAll(checkBoxesController, newMirror, htmlElementsEC);

        if (!ECMailInput.value || (!ECPhoneInput.value && ECAreaInput.value) || (ECPhoneInput.value && !ECAreaInput.value)) {
            alert('Ocorreu um erro! Certifique-se de estar enviando os campos de Enhanced Conversions corretamente');
            resetCodeMirror();
            return;
        }

        // fazendo uma identação do código javascript gerado dentro do editor de código
        const beautifiedCodeEC = js_beautify(newMirror.getValue());

        // setando o código identado dentro do editor novamente
        newMirror.setValue(`${beautifiedCodeEC.replace(/(\n+)/g, "\n")}`);

        // deixando codigo mais bonito
        const allCode = js_beautify(codeMirror.getValue());
        const allCodeEC = js_beautify(newMirror.getValue());

        // setando o codigo bonito
        codeMirror.setValue(`<script>\n${allCodeEC}\n</script>\n\n<script>\n${allCode}\n</script>`);

        // mostrando janela com o código gerado, identado e editado.
        codeEditorPopup(codeMirror);

        // resetando todo o form para novamente gerar outros códigos;
        formReset();
        return;
    });
}

export { enhancedConversions }