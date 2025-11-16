import stripe
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.conf import settings

@api_view(['POST'])
def create_payment_intent(request):
    try:
        data = request.data
        amount = int(data.get("amount", 0))  # in paise for INR
        currency = "inr"

        payment_intent = stripe.PaymentIntent.create(
            amount=amount,
            currency=currency,
            automatic_payment_methods={"enabled": True}
        )
        # return Response({"paymentIntent": payment_intent})
        return Response({"clientSecret": payment_intent.client_secret})
    except Exception as e:
        return Response({"error": str(e)}, status=400)
