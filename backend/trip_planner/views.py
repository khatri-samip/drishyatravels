from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status


ROUTES = {
    "Adventure": "Kathmandu → Pokhara → Annapurna region",
    "Culture": "Kathmandu → Bhaktapur → Patan → Bandipur",
    "Wildlife": "Kathmandu → Chitwan → Pokhara",
    "Relaxed": "Kathmandu → Pokhara → Bandipur",
}


@api_view(["POST"])
def plan_trip(request):

    style = request.data.get("style")
    days = request.data.get("days")
    month = request.data.get("month")
    people = request.data.get("people")

    if not all([style, days, month, people]):
        return Response(
            {
                "error": "All fields are required."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    route = ROUTES.get(style)

    if not route:
        return Response(
            {
                "error": "Invalid trip style."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        people = int(people)
    except (TypeError, ValueError):
        return Response(
            {
                "error": "Travellers must be a number."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    if people < 1:
        return Response(
            {
                "error": "There must be at least one traveller."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    return Response({
        "route": route,
        "style": style,
        "days": days,
        "month": month,
        "people": people,
    })


