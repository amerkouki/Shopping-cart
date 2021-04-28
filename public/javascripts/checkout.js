Stripe.setPublishableKey('pk_test_51IQHveIhmAFyeETacyxkmQW9HkjvmE8ddS8gjtimLQSqrwTV3wDUQXf7Dc0cFmhKyPmRWRLHJAbcaOIojgzH9q6P00BSypHSA6');


var form = document.getElementById('payment-form');
var form_error = document.getElementById('payment-errors');

var card_number = document.getElementById('card-number');
var card_cvc = document.getElementById('card-cvc');
var card_expiry_month = document.getElementById('card-expiry-month');
var card_expiry_year = document.getElementById('card-expiry-year');




form.elements["btn"].addEventListener("click", function () {

  form_error.classList.add("d-none");
  form.elements["btn"].disabled = true;


  Stripe.card.createToken({
    number: card_number.value,
    cvc: card_cvc.value,
    exp_month: card_expiry_month.value,
    exp_year: card_expiry_year.value
  }, stripeResponseHandler);



  return false;
});



function stripeResponseHandler(status, response) {

  // Grab the form:
  var $form = $('#payment-form');

  console.log(response.error);

  if (response.error) { // Problem!

    form_error.classList.remove("d-none");
    form.elements["btn"].disabled = false;

    //form_error.innerHTML = response.error.message ;
    $('#payment-errors').text(response.error.message);

    // Show the errors on the form
    //$form.find('#payment-errors').text(response.error.message);
    //$form.find('button').prop('disabled', false); // Re-enable submission

  } else { // Token was created!

    // Get the token ID:
    var token = response.id;


    // Insert the token into the form so it gets submitted to the server:
     $form.append($('<input type="hidden" name="stripeToken" />').val(token));

    // Submit the form:
    $form.get(0).submit();

  }
}
