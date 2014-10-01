//load dinamico de js externo
function loadJsAsync(url, callback) {
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.onreadystatechange = callback;
    script.onload = callback;
    head.appendChild(script);
}

loadJsAsync("//code.jquery.com/jquery-1.11.0.min.js", function () {
    console.log("jQuery Running ...");

    loadJsAsync("https://secure.mlstatic.com/org-img/checkout/custom/1.0/checkout.js", function () {
        console.log("MercadoPago Running ...");
        Checkout.setPublishableKey(PublicKeyMercadoPagoTransparent);
        $.noConflict();
        //end load mp
    });
    //end load js
});


function loadFilesMP() {
    loadJsAsync("//code.jquery.com/jquery-1.11.0.min.js", function () {
        $.noConflict();
        jQuery(document).ready(function ($) {
            
            //hide loading
            $("#status .loading-mp").hide();
            
            //caso o cart�o copie e cole
            $("input[data-checkout='cardNumber']").focusout(function () {
                var card = $(this).val().replace(/ /g, '').replace(/-/g, '').replace(/\./g, '');
                var bin = card.substr(0,6);
                getBin(bin);
            });
            
            //pega o bin enquanto digita
            $("input[data-checkout='cardNumber']").bind("keyup", function () {
                var bin = $(this).val().replace(/ /g, '').replace(/-/g, '').replace(/\./g, '');
                getBin(bin);
            });

            $("#mp-form input").focusout(function () {
                validCreateToken();
            });
            
            $("#mp-form select").change(function () {
                validCreateToken();
            });
            
            
            function getBin(bin){
                if (bin.length == 6) {
                    Checkout.getPaymentMethod(bin, function (status, result) {
                        var method_payment = result[0];
                        
                        //adiciona a imagem do meio de pagamento
                        $("#img_payment_method").html('<img src="' + method_payment.thumbnail + '">')
                        $("#payment_method").val(method_payment.id);
                        
                        //lista parcelas
                        Checkout.getInstallments(method_payment.id ,parseFloat($("#amount").val()), setInstallmentInfo);
                    });
                }
            }
            
            function validCreateToken(){
                        
                var valid = true;
                
                //verifica os elementos "input"
                $("#mp-form input[data-checkout]").each(function () {

                    if ($(this).val() == "") {
                        valid = false
                    }

                });

                //verifica os elementos "select"
                $("#mp-form select[data-checkout]").each(function () {
                    if ($(this).find("option:selected").val() == "") {
                        valid = false
                    }
                });
                
                if (valid) {
                    //add msg e mostra o loading
                    $("#status .status-mp").show();
                    $("#status .text-mp").html('Validando dados...');
                    $("#status").addClass("msg-alert");
                    
                    
                    var $form = $("#mp-form");

                    Checkout.createToken($form, function (status, response) {
                        removeClass();
                        console.log(status, response)
                        var html = ""
                        if (status == 200  || status == 201) {
                            $("#status .status-mp").hide();
                            $("#card_token_id").val(response.id);
                            $("#status").addClass("msg-success");
                            html = "Dados validados!";
                        }else{
                            
                            $.each(response.cause, function(p, e){
                                
                                //mapea os erros
                                switch (e.code) {
                                    case "011":
                                        html += "Ocorreu um erro. Por favor, atualize a pagina. </br>";
                                        break;
                                    case "E301":
                                        html += "Numero do Cart�o inv�lido. </br>";
                                        break;
                                    
                                    case "E302":
                                        html += "C�digo de Seguran�a inv�lido. </br>";
                                        break;
                                    
                                    case "316":
                                        html += "Nome do titular do cart�o inv�lido. </br>";
                                        break;
                                    case "324":
                                        html += "Documento inv�lido. </br>";
                                        break;
                                    case "325":
                                        html += "M�s inv�lido. </br>";
                                        break;
                                    case "326":
                                        html += "Ano inv�lido. </br>";
                                        break;
                                    default:
                                        html += "Dados incorretos, valide os dados. Por favor. <br/>"
                        
                                }
                            });
                            
                            
                            $("#status").addClass("msg-error");
                            $("#card_token_id").val("");
                        }
                        
                        //mostra mensagem de ok e esconde loading
                        $("#status .text-mp").html(html);
                        
                    });
                    
                }
            }
            
            //setta parcelas
            function setInstallmentInfo(status, installments){
                var html_options = '<option value=""> Escolha... </option>';
                for(i=0; installments && i<installments.length; i++){
                    html_options += "<option value='"+installments[i].installments+"'>"+installments[i].installments +" de "+installments[i].share_amount+" ("+installments[i].total_amount+")</option>";
                };
                $("#installments").html(html_options);
            }

            function removeClass(){
                //remove as class
                $("#status").removeClass("msg-error");
                $("#status").removeClass("msg-success");
                $("#status").removeClass("msg-alert");
            }
            //end load ready
        });
        //end load js
    });

}