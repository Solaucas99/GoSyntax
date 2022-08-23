const NOBOXES_CHECKED = function (checkBoxesController, codeMirror, htmlElements) {
    // caso nenhuma checkbox esteja checada solicita pra criar um código
    if (Object.values(checkBoxesController).every(element => element === false)) {
        alert('Por favor, crie um filtro antes de gerar o código!');
        codeMirror.setValue("\n".repeat(15));
        return;
    }
};

const URLBOX_CHECKED = function (checkBoxesController, codeMirror, htmlElements) {
    if (checkBoxesController.urlBoxChecked) {
        if (htmlElements.urlTypeSelector === 'includes') {
            codeMirror.replaceRange(`if (window.location.href.includes('${htmlElements.urlTextSelector}')) { `, {line: 1});
            codeMirror.replaceRange(`};`, {line: 9});

            codeMirror.readOnly = true;
            return;
        }

        if (htmlElements.urlTypeSelector === 'no-includes') {
            codeMirror.replaceRange(`if (!window.location.href.includes('${htmlElements.urlTextSelector}')) { `, {line: 1});
            codeMirror.replaceRange(`};`, {line: 9});

            codeMirror.readOnly = true;
            return;
        }

        if (htmlElements.urlTypeSelector === 'equals') {
            codeMirror.replaceRange(`if (window.location.href === '${htmlElements.urlTextSelector}') { `, {line: 1});
            codeMirror.replaceRange(`};`, {line: 9});

            codeMirror.readOnly = true;
            return;
        }

        if (htmlElements.urlTypeSelector === 'not-equals') {
            codeMirror.replaceRange(`if (window.location.href !== '${htmlElements.urlTextSelector}') { `, {line: 1});
            codeMirror.replaceRange(`};`, {line: 9});

            codeMirror.readOnly = true;
            return;
        }

        return;
    }
};

const DOMLOADEDBOX_CHECKED = function (checkBoxesController, codeMirror, htmlElements) {
    if (checkBoxesController.domContentLoadedChecked) {     
        codeMirror.replaceRange(`document.addEventListener('DOMContentLoaded', function() {`, {line: 2});
        codeMirror.replaceRange(`});`, {line: 8});

        codeMirror.readOnly = true;
        return;
    }
};

const TRIGGER_TYPE = function (checkBoxesController, codeMirror, htmlElements) {
    if (checkBoxesController.triggerType === 'no-trigger') {
        codeMirror.readOnly = true;

        return;
    }

    if (checkBoxesController.triggerType === 'event') {
        codeMirror.replaceRange(`document.querySelector('${htmlElements.selectorInputCss}').addEventListener('${htmlElements.eventTypeSelector}', function() {`, {line: 3});
        codeMirror.replaceRange('});', {line: 6})
        codeMirror.readOnly = true;

        return;
    }

    if (checkBoxesController.triggerType === 'event-multiple') {
        codeMirror.replaceRange(`document.querySelectorAll('${htmlElements.selectorInputCss}').forEach(function (element) { \n  element.addEventListener('${htmlElements.eventTypeSelector}', function() {`, {line: 3});
        codeMirror.replaceRange('  }); \n });', {line: 6});
        
        codeMirror.readOnly = true;
        
                
        return;
    }

    if (checkBoxesController.triggerType === 'body-message') {
        var code1 = `var googleForm = '${htmlElements.messageTextSelector}'; \n (function googleFormValidation() { \n if (document.body && document.body.innerText.includes(googleForm)) { \n console.log('funcionou!');`

        var code2 = ` } else { \n setTimeout(googleFormValidation, 500); \n } \n })();`;

        codeMirror.replaceRange(code1, {line: 3});
        codeMirror.replaceRange(code2, {line: 6});
        
        codeMirror.readOnly = true;
                
        return;
    }
}

export const eventObserversArray = [URLBOX_CHECKED, DOMLOADEDBOX_CHECKED, NOBOXES_CHECKED, TRIGGER_TYPE]