const URLBOX_CHECKED = function (checkBoxesController, codeMirror, htmlElements) {
    if (checkBoxesController.urlBoxCheckedEC) {
        if (htmlElements.urlTypeECSelector === 'includes') {
            codeMirror.replaceRange(`if (window.location.href.includes('${htmlElements.urlTextECSelector}')) { `, {line: 1});
            codeMirror.replaceRange(`}`, {line: 9});

            codeMirror.readOnly = true;
            return;
        }

        if (htmlElements.urlTypeECSelector === 'no-includes') {
            codeMirror.replaceRange(`if (!window.location.href.includes('${htmlElements.urlTextECSelector}')) { `, {line: 1});
            codeMirror.replaceRange(`};`, {line: 9});

            codeMirror.readOnly = true;
            return;
        }

        if (htmlElements.urlTypeECSelector === 'equals') {
            codeMirror.replaceRange(`if (window.location.href === '${htmlElements.urlTextECSelector}') { `, {line: 1});
            codeMirror.replaceRange(`};`, {line: 9});

            codeMirror.readOnly = true;
            return;
        }

        if (htmlElements.urlTypeECSelector === 'not-equals') {
            codeMirror.replaceRange(`if (window.location.href !== '${htmlElements.urlTextECSelector}') { `, {line: 1});
            codeMirror.replaceRange(`};`, {line: 9});

            codeMirror.readOnly = true;
            return;
        }

        return;
    }
};

const EC_TYPE = function (checkBoxesController, codeMirror, htmlElements) {
    if (!htmlElements.emailValue || (!htmlElements.phoneValue && htmlElements.areaValue) || (htmlElements.phoneValue && !htmlElements.areaValue)) {
        codeMirror.setValue("\n".repeat(15));
        return;
    }

    if (htmlElements.enhancedConversionTypeSelector === 'form') {
        if (htmlElements.phoneValue) {
                const code = `
                var email = document.querySelector('${htmlElements.emailValue}');
                var phone = document.querySelector('${htmlElements.phoneValue}');
                var area = '${htmlElements.areaValue}';

                var validateEmail = function (email) {
                    var re = new RegExp('/\S+@\S+\.\S+/');
                    return re.test(email);
                }

                email.addEventListener('input', function() {
                    if (validateEmail(email.value)) {
                        localStorage.setItem('ec_email', email.value);
                    }
                });

                phone.addEventListener('input', function() {
                    if (validatePhone(phone.value)) {
                        localStorage.setItem('ec_phone', area + phone.value.replace(/\D/g,''));
                    }
                })
            `;

            codeMirror.replaceRange(code, {line: (codeMirror.lineCount() / 2) - 1});

            codeMirror.readOnly = true;
            return;
        }

        const code = `
            var email = document.querySelector('${htmlElements.emailValue}');

            var validateEmail = function (email) {
                var re = new RegExp('/\S+@\S+\.\S+/');
                return re.test(email);
            }

            email.addEventListener('input', function() {
                if (validateEmail(email.value)) {
                    localStorage.setItem('ec_email', email.value);
                }
            });
        `;

        codeMirror.replaceRange(code, {line: (codeMirror.lineCount() / 2) - 1});

        codeMirror.readOnly = true;
        return;
    }

    if (htmlElements.enhancedConversionTypeSelector === 'form-purchase') {
        if (htmlElements.phoneValue) {
            const code = `
            var email = document.querySelector('${htmlElements.emailValue}');
            var phone = document.querySelector('${htmlElements.phoneValue}');
            var area = '${htmlElements.areaValue}';

            var validateEmail = function (email) {
                var re = new RegExp('/\S+@\S+\.\S+/');
                return re.test(email);
            }

            var validatePhone = function (phone) {
                var filteredPhone = phone.replace(/\D/g,'');
                return filteredPhone.length >= 10 && filteredPhone.length <= 11;
            }

            email.addEventListener('input', function() {
                if (validateEmail(email.value)) {
                    localStorage.setItem('ec_email', email.value);
                }
            });

            phone.addEventListener('input', function() {
                if (validatePhone(phone.value)) {
                    localStorage.setItem('ec_phone', area + phone.value.replace(/\D/g,''));
                }
            })
        `;

        codeMirror.replaceRange(code, {line: (codeMirror.lineCount() / 2) - 1});

        codeMirror.readOnly = true;
        return;
    }

        const code = `
            var email = document.querySelector('${htmlElements.emailValue}');

            var validateEmail = function (email) {
                var re = new RegExp('/\S+@\S+\.\S+/');
                return re.test(email);
            }

            email.addEventListener('input', function() {
                if (validateEmail(email.value)) {
                    localStorage.setItem('ec_email', email.value);
                }
            });
        `;

        codeMirror.replaceRange(code, {line: (codeMirror.lineCount() / 2) - 1});

        codeMirror.readOnly = true;
        return;
    }
}




export const eventObserversECArray = [URLBOX_CHECKED, EC_TYPE]