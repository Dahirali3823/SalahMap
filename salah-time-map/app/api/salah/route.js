// DD-MM-YYYY format (i feel unamerican but thats what the api requires)
const FormatTime = () =>{
    const date = new Date();
    const day = date.getDate().toString().padStart(2,"0")
    const month = (date.getMonth()+1).toString().padStart(2,"0")
    const year = date.getFullYear()

    const today = `${day}-${month}-${year}`
    return today
}
//GET request for the api
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const country = searchParams.get("country");
    const state = searchParams.get("state")
    const lat = searchParams.get("latitude")
    const lng = searchParams.get("longitude")
    let apiUrl;
    const date = FormatTime()
    console.log("Coordinates",lat,lng)
    if (state) {
        apiUrl = `https://api.aladhan.com/v1/timingsByCity?city=${city}&state=${state}&country=${country}`;
    }
    else if(lat && lng) {
        apiUrl = `https://api.aladhan.com/v1/timings/${date}?latitude=${lat}&longitude=${lng}`

    }
    else{
        apiUrl = `https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}`;
    }
    console.log("API URL", apiUrl)
   

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error("Failed to recieve response");

        }
        const data = await response.json();
        console.log("Info:", data);
        return Response.json({
            success: true,
            data: data.data.timings, //set data as salah times 
            location: { city, state, country,lat,lng} // define location
            ,
        });

    } catch (error) {
        return Response.json({
            success: false,
            message: error.message
        }, { status: 500 });
    }

}
