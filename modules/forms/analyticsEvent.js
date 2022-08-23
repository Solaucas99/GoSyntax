import { subject } from '../observerPattern.js';
import { eventObserversArray } from '../observerModules/observerEvents.js'
import { codeEditorPopup } from '../utils/codeEditor.js';
import { codeMirror, resetCodeMirror } from '../utils/getCodeMirror.js';

function analyticsEvent() {
    // instanciando o form de Ads Conversion Code
    const formAnalyticsEvent = document.querySelector('form#formAnalyticsEvent');

    // selecionando as checkboxes disponíveis
    const checkboxUrl = formAnalyticsEvent.querySelector('input#enableUrlFilter');
    const checkboxDomContentLoaded = formAnalyticsEvent.querySelector('input#enableDomContentLoaded');
    const triggerType = formAnalyticsEvent.querySelector('select#triggerType');

    //Seletores de combinação - Select
    const eventTypeSelect = formAnalyticsEvent.querySelector('select#eventType');
    const urlTypeSelect = formAnalyticsEvent.querySelector('select#urlType');
    const messageTypeSelect = formAnalyticsEvent.querySelector('select#messageType');

    //Seletores de combinação - Inputs
    const urlTextInput = formAnalyticsEvent.querySelector('input#urlText');
    const messageTextInput = formAnalyticsEvent.querySelector('input#messageText');
    const cssSelectorInput = formAnalyticsEvent.querySelector('input#selectorCss');

    //Seletores de Combinação - Divs
    const parametersDiv = formAnalyticsEvent.querySelector('div.parametersDiv');

    //Seletores de Combinação - Buttons
    const addEventParameter = formAnalyticsEvent.querySelector('button#addParameter');

    // criando um controller interruptor das checkboxes da extensão.
    const checkBoxesController = {
        urlBoxChecked: false,
        domContentLoadedChecked: false,
        triggerType: triggerType.value,

    };

    // função para resetar o formulário após o envio do mesmo.
    const formReset = function() {
        // resetando campos do form
        formAnalyticsEvent.reset();

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

        // limpando as caixas de parametros
        const allSpanElements = Array.from(parametersDiv.childNodes);

        // para cada parametro fazer a remoção.
        if (allSpanElements.length > 0) {
            allSpanElements.forEach(element => element.remove());
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

    addEventParameter.addEventListener('click', function(ev) {
        ev.stopPropagation();

        const spanParameter = document.createElement('span');
        spanParameter.classList.add('parametersLine');

        spanParameter.innerHTML = `
                <label>
                    Nome do Parâmetro
                    <input type="text" class="parameterName" />
                </label>
                
                <label>
                    Valor do Parâmetro
                    <input type="text" class="parameterValue" />
                </label>
                <button type="button" name="removeParameter" class="removeParameter">X</button>
        `;

        const removeBtn = spanParameter.querySelector('button.removeParameter');
        removeBtn.addEventListener('click', function (ev) {
            ev.stopPropagation();

            removeBtn.parentNode.remove();
        });


        const divParameters = parametersDiv;

        divParameters.appendChild(spanParameter);
        
    }); 

    // capturando envio do formulário
    formAnalyticsEvent.addEventListener('submit', function (ev) {
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

        const eventName = formAnalyticsEvent.querySelector('input#eventName').value;
        const allParameters = Array.from(formAnalyticsEvent.querySelectorAll('span.parametersLine'));
        const parametersObj = {};
        const parametersCheck = {hasError: false, msg: ''};

        if (!eventName) {
            alert('Para a geração do código, o nome do evento deve ser adicionado!');
            resetCodeMirror();
            return;
        }

        if (allParameters.length === 0) {
            alert('Para a geração do código, no mínimo 1 parâmetro deve ser adicionado!');
            resetCodeMirror();
            return;
        }

        allParameters.forEach(function(element) {
            const parameterName = element.querySelector('input.parameterName').value;
            const parameterValue = element.querySelector('input.parameterValue').value;

            if (!parameterName || !parameterValue) {
                parametersCheck.hasError = true;
                parametersCheck.msg = 'Existe parâmetros em branco, favor fazer a correção!'
                return;
            }

            const parametersKeys = Object.keys(parametersObj);

            for (let i in parametersKeys) {
                if (parametersKeys[i] === parameterName) {
                    parametersCheck.hasError = true;
                    parametersCheck.msg = 'Existe uma repetição de parâmetro! Corrija para prosseguir com a geração do código.'
                    return;
                }
            }
            
            parametersObj[parameterName] = parameterValue;
        });

        if (parametersCheck.hasError) {
            alert(parametersCheck.msg);
            resetCodeMirror();
            return;
        }

        // colocando comentário no meio do editor de códigos
        codeMirror.replaceRange(`
            gtag('event', '${eventName}', ${js_beautify(JSON.stringify(parametersObj))});`, {line: (codeMirror.lineCount() / 2) - 1});

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

export { analyticsEvent }