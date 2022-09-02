import { subject } from '../observerPattern.js';
import { eventObserversArray } from '../observerModules/observerEvents.js'
import { codeEditorPopup } from '../utils/codeEditor.js';
import { codeMirror, resetCodeMirror } from '../utils/getCodeMirror.js';

function dataLayer() {
    // instanciando o form de Ads Conversion Code
    const formDataLayer = document.querySelector('form#formDataLayer');

    // selecionando as checkboxes disponíveis
    const checkboxUrl = formDataLayer.querySelector('input#enableUrlFilter');
    const checkboxDomContentLoaded = formDataLayer.querySelector('input#enableDomContentLoaded');
    const triggerType = formDataLayer.querySelector('select#triggerType');

    //Seletores de combinação - Select
    const eventTypeSelect = formDataLayer.querySelector('select#eventType');
    const urlTypeSelect = formDataLayer.querySelector('select#urlType');
    const messageTypeSelect = formDataLayer.querySelector('select#messageType');

    //Seletores de combinação - Inputs
    const urlTextInput = formDataLayer.querySelector('input#urlText');
    const messageTextInput = formDataLayer.querySelector('input#messageText');
    const cssSelectorInput = formDataLayer.querySelector('input#selectorCss');

    //Seletores de combinação - Divs
    const objectDiv = formDataLayer.querySelector('div.objDiv');

    //Seletores de combinação - Buttons
    const addKeyValue = formDataLayer.querySelector('button#addKeyValue');

    // criando um controller interruptor das checkboxes da extensão.
    const checkBoxesController = {
        urlBoxChecked: false,
        domContentLoadedChecked: false,
        triggerType: triggerType.value,
    };

    // função para resetar o formulário após o envio do mesmo.
    const formReset = function() {
        // resetando campos do form
        formDataLayer.reset();

        // zerando controllers dos checkboxes
        checkBoxesController.urlBoxChecked = false;
        checkBoxesController.domContentLoadedChecked = false;
        checkBoxesController.triggerType = triggerType.value;

        // desabilitando selects dentro do HTML
        eventTypeSelect.setAttribute('disabled', '');
        urlTypeSelect.setAttribute('disabled', '');
        urlTextInput.setAttribute('disabled', '');
        messageTypeSelect.setAttribute('disabled', '');
        messageTextInput.setAttribute('disabled', '');
        cssSelectorInput.setAttribute('disabled', '');

        // limpando as caixas de parametros
        const allObjElements = Array.from(objectDiv.childNodes);

        // para cada parametro fazer a remoção.
        if (allObjElements.length > 0) {
            allObjElements.forEach(element => element.remove());
        }
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

        if (triggerType.value === 'no-trigger') {
            messageTypeSelect.setAttribute('disabled', '');
            messageTextInput.setAttribute('disabled', '');
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

    addKeyValue.addEventListener('click', function(ev) {
        ev.stopPropagation();

        const spanKeyValue = document.createElement('span');
        spanKeyValue.classList.add('keyValueLine');

        spanKeyValue.innerHTML = `
                <label>
                    Chave
                    <input type="text" class="objKey" />
                </label>
                
                <label>
                    Valor
                    <input type="text" class="objValue" />
                </label>
                
                <button type="button" name="removeKeyValue" class="removeKeyValue">X</button>
        `;

        const removeBtn = spanKeyValue.querySelector('button.removeKeyValue');
        removeBtn.addEventListener('click', function (ev) {
            ev.stopPropagation();

            removeBtn.parentNode.remove();
        });


        const dataLayerObj = objectDiv;

        dataLayerObj.appendChild(spanKeyValue);
        
    }); 

    // capturando envio do formulário
    formDataLayer.addEventListener('submit', function (ev) {
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

        if (triggerType.value === 'no-trigger' && (!checkBoxesController.urlBoxChecked && !checkBoxesController.domContentLoadedChecked)) {
            alert('Sem disparador definido, você deverá selecionar ou filtro de URL ou Dom Content Loaded!');
            resetCodeMirror();
            return;
        }

        // fazendo uma identação do código javascript gerado dentro do editor de código
        const beautifiedCode = js_beautify(codeMirror.getValue());

        // setando o código identado dentro do editor novamente
        codeMirror.setValue(`${beautifiedCode.replace(/(\n+)/g, "\n")}`);

        const allKeyValue = Array.from(formDataLayer.querySelectorAll('span.keyValueLine'));
        const keyValueObj = {};
        const keyValueCheck = {hasError: false, msg: ''};
        let valueString = ``;

        if (allKeyValue.length === 0) {
            alert('Para a geração do código, no mínimo 1 par chave/valor deve ser adicionado!');
            resetCodeMirror();
            return;
        }

        allKeyValue.forEach(function(element) {
            const objKey = element.querySelector('input.objKey').value;
            const objValue = element.querySelector('input.objValue').value;

            if (!objKey || !objValue) {
                keyValueCheck.hasError = true;
                keyValueCheck.msg = 'Existe parâmetros em branco, favor fazer a correção!'
                return;
            }

            const objKeys = Object.keys(keyValueObj);

            for (let i in objKeys) {
                if (objKeys[i] === objKey) {
                    keyValueCheck.hasError = true;
                    keyValueCheck.msg = 'Existe uma repetição de chave! Corrija para prosseguir com a geração do código.'
                    return;
                }
            }

            keyValueObj[objKey] = objValue;
            valueString += `${objKey}: ${objValue},`;
        });

        if (keyValueCheck.hasError) {
            alert(keyValueCheck.msg);
            resetCodeMirror();
            return;
        }

        console.log(keyValueObj);

        // colocando comentário no meio do editor de códigos
        codeMirror.replaceRange(js_beautify(`\n dataLayer.push({ \n     ${valueString}    \n  });`), {line: (codeMirror.lineCount() / 2) - 1});

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

export { dataLayer }