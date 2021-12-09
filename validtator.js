function Validator(formSelector) {
    var _this = this;
    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }
    var formRules = {}
    var validatorRules = {
        required: function (value) {
            return value ? undefined : 'Vui lòng nhập trường này'
        },
        email: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : 'Sai định dạng Email'
        },
        min: function (min) {
            return function (value) {
                return value.length >= min ? undefined : `Nhập tối thiểu ${min} kí tự`
            }
        },
        max: function (max) {
            return function (value) {
                return value.length <= max ? undefined : `Nhập tối đa ${max} kí tự`
            }
        }
    }
    var formElement = document.querySelector(formSelector)
    if (formElement) {
        var inputTags = formElement.querySelectorAll('[name][rules]')
        for (var inputTag of inputTags) {
            var ruleNames = inputTag.getAttribute('rules').split('|')
            for (var ruleName of ruleNames) {
                var ruleInfor
                var isRuleHasValue = ruleName.includes(':')
                if (isRuleHasValue) {
                    ruleInfor = ruleName.split(':')
                    ruleName = ruleInfor[0]
                }
                var ruleFunc = validatorRules[ruleName]
                if (isRuleHasValue) {
                    ruleFunc = ruleFunc(ruleInfor[1])
                }
                if (Array.isArray(formRules[inputTag.name])) {
                    formRules[inputTag.name].push(ruleFunc)
                } else {
                    formRules[inputTag.name] = [ruleFunc]
                }
            }
            inputTag.onblur = handleValidate
            inputTag.oninput = handleClearError
        }
        function handleValidate(e) {
            var rules = formRules[e.target.name]
            var errorMessage;
            for (var rule of rules) {
                errorMessage = rule(e.target.value)
                break
            }
            if (errorMessage) {
                var formGroup = getParent(e.target, '.form-group')
                if (formGroup) {
                    formGroup.classList.add('invalid')
                    var errorTag = formGroup.querySelector('.form-message')
                    if (errorTag) {
                        errorTag.innerText = errorMessage

                    }
                }
            }
            return !errorMessage
        }
        function handleClearError(e) {
            var formGroup = getParent(e.target, '.form-group')
            if (formGroup.classList.contains('invalid')) {
                formGroup.classList.remove('invalid')
                var errorTag = formGroup.querySelector('.form-message')
                if (errorTag) {
                    errorTag.innerText = ''
                }
            }
        }
    }
    formElement.onsubmit = function (event) {
        event.preventDefault()
        var inputTags = formElement.querySelectorAll('[name][rules]')
        var isValid = true
        for (var inputTag of inputTags) {
            if (!handleValidate({ target: inputTag }))
                isValid = false
        }
        if (isValid) {
            if (typeof _this.onSubmit === 'function') {
                var enableInputs = formElement.querySelectorAll('[name]')
                var formValues = Array.from(enableInputs).reduce(function (values, input) {
                    switch (input.type) {
                        case 'radio':
                            values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value
                            break;
                        case 'checkbox':
                            if (!input.matches(':checked')) {
                                values[input.name] = ''
                                return values
                            }
                            if (!Array.isArray(values[input.name])) {
                                values[input.name] = []
                            }
                            values[input.name].push(input.value)
                            break;
                        case 'file':
                            values[input.name] = input.files
                            break;
                        default:
                            values[input.name] = input.value
                    }
                    return values
                }, {})
                _this.onSubmit(formValues)
            } else {
                formElement.submit()

            }
        }
    }
}