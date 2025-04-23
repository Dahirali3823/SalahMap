"use client"; // allows us to use react/use state on client side
import { useState, useEffect, Component } from "react"; //import usestate,useeffect hooks from react

let map: google.maps.Map; //creates a map called map

// function that loads google script dynamically
const loadGoogleMapsScript = () => {
  // return a promise
  return new Promise<void>((resolve, reject) => {
    if (typeof google !== "undefined" && google.maps) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}&libraries=places,marker`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = (error) => reject(error);
    document.head.appendChild(script);
  });
};



// big boy function with everything in it lol
export default function Home() {
  // define different variables and Use state for them
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");

  const [salahTimes, setsalahTimes] = useState<Record<string, string> | null>(
    null
  );


  // processes salahs by formatting data to allow only 5 fardh salahs and time to 12 hr format
  // moved it up top so draggable marker can process salah too
  const processSalah = (data: any) => {
    const fardhSalah = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
    const test = Object.entries(data).filter(([prayer, time]) =>
      fardhSalah.includes(prayer)
    );
    // convert to 12 hr format
    const time = test.map(([prayer, time]) => [
      prayer,
      convertTo12HourFormat(time as string),
    ]);

    const salahTimesObject = Object.fromEntries(time);
    return salahTimesObject;
  };

  // intializes map, creates a draggable marker, adds a listner to fetch salah times when marker is clicked
  // added a polyon around minnesota
  const initMap = () => {
    const infoWindow = new google.maps.InfoWindow();

    //create new map at a certain position
    map = new google.maps.Map(document.getElementById("map") as HTMLElement, {
      center: { lat: 12.8628, lng: 30.2176 },
      zoom: 2,
      mapId: "b79cb21c187c250c",
    });

    const grid = (link: string) => {
      console.log("grid reloaded");
      fetch(link)
        .then((response) => response.json())
        .then((geojsonData) => {
          // Clear existing data if needed
          map.data.forEach((feature) => map.data.remove(feature));

          // Add GeoJSON to the map
          map.data.addGeoJson(geojsonData);

          // Define a color map (or use a random generator)
          const colorMap = new Map();
          let colorIndex = 0;
          const colors = [
            "#e6194b",
            "#3cb44b",
            "#ffe119",
            "#4363d8",
            "#f58231",
            "#911eb4",
            "#46f0f0",
            "#f032e6",
            "#bcf60c",
            "#fabebe",
            "#008080",
            "#e6beff",
            "#9a6324",
            "#fffac8",
            "#800000",
            "#aaffc3",
            "#808000",
            "#ffd8b1",
            "#000075",
            "#808080",
          ];

          // Style dynamically based on feature properties
          map.data.setStyle((feature) => {
            const regionId =
              feature.getProperty("tzid") ||
              feature.getProperty("id") ||
              Math.random().toString();

            if (!colorMap.has(regionId)) {
              colorMap.set(regionId, colors[colorIndex % colors.length]);
              colorIndex++;
            }

            return {
              strokeColor: "black",
              strokeOpacity: 0.5,
              strokeWeight: 1,
              fillColor: colorMap.get(regionId),
              fillOpacity: 0.2,
            };
          });
        })
        .catch((error) => {
          console.error("Error loading GeoJSON:", error);
        });
    };

    let gridUrl = "/combined-now.geojson";
    grid(gridUrl);

    map.addListener("zoom_changed", () => {
      const zoom = map.getZoom() ?? 0;

      console.log(`Zoom level: ${zoom}`);
    });
    
    //intializes a draggable marker on map

    const marker = new google.maps.marker.AdvancedMarkerElement({
      map,
      position: { lat: 40.71, lng: 74.0060 },
      gmpDraggable: true,
    });

    const geocoder = new google.maps.Geocoder();

    // add a listner to the marker so when clicked it sends a fetch request to the backend to get salah times for map
    marker.addListener(
      "click",
      async (event: { domEvent: PointerEvent; latLng: google.maps.LatLng }) => {
        const { latLng } = event;
        console.log("Marker coordinates", latLng.toString());
        const lat = latLng.lat();
        const lng = latLng.lng();
        try {
          let response = await fetch(
            `/api/salah?latitude=${lat}&longitude=${lng}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch Salah times");
          }
          const data = await response.json();
          console.log(data.data); // view salah times on frontend console
          console.log(data.location); // view location on frontend console
          const test = processSalah(data.data);
          setsalahTimes(test);

          // reverse geocode coordinates to a defined city,state and country
          geocoder.geocode(
            { location: { lat, lng } },
            (results: google.maps.GeocoderResult[] | null, status: string) => {
              if (status == "OK" && results && results.length > 1) {
                console.log(results[0]);
                const addressComponents = results[0].address_components;
                let foundCity = "";
                let foundState = "";
                let foundCountry = "";

                addressComponents.forEach((component) => {
                  if (component.types.includes("locality")) {
                    foundCity = component.long_name;
                  } else if (
                    component.types.includes("administrative_area_level_1")
                  ) {
                    foundState = component.long_name;
                  } else if (component.types.includes("country")) {
                    foundCountry = component.long_name;
                  }
                });
                setCity(foundCity);
                setCountry(foundCountry);
                setState(foundState);
              } else {
                console.warn("Geocoder failed or no results found", status);
              }
            }
          );
        } catch (error) {
          console.error("Error fetching Salah times:", error);
        }
      }
    );


  };

  // map only initalizes if
  useEffect(() => {
    loadGoogleMapsScript()
      .then(() => {
        initMap(); // Call initMap once the script has loaded
      })
      .catch((error) => {
        console.error("Error loading Google Maps API:", error);
      });
  }, []);

  // convert time to 12 hrs from 24
  // Need to sort out how to make 0:00 (12pm) work?
  const convertTo12HourFormat = (time: string) => {
    const [hourstr, minutestr] = time.split(":");
    let hour = Number(hourstr);
    let minute = Number(minutestr);
    let period = "AM";
    if (hour >= 12) {
      hour = hour - 12;
      period = "PM";
    } else if (hour == 0) {
      hour = 12;
      period = "PM";
    }

    let newTime =
      hour + ":" + minute.toString().padStart(2, "0") + " " + period;

    return newTime;
  };

  // processes salah by filtering and cleaning up the api returns

  const OnSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await fetch(
        `/api/salah?city=${city}&state=${state}&country=${country}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch Salah times");
      }
      const data = await response.json();
      console.log("Salah times", data.data); // view salah times on frontend console
      console.log("Location", data.location); // view location on frontend console
      const test = processSalah(data.data);
      setsalahTimes(test);
    } catch (error) {
      console.error("Error fetching Salah times:", error);
    }
  };
  // creates Salah table via JSX 
  const CreateTable = (salahTimes: Record<string, string>) => {
    return (
      <div className="table-auto  overflow-x-auto shadow-lg rounded-sm ">
        <table className="min-w-full border-collapse border rounded-lg overflow-hidden ">
          <caption className="bg-stone-200">
            {" "}
            Salah Times for {city},{state},{country}
          </caption>
          <thead>
            <tr>
              <th className="px-4 py-2 text-center border  bg-gray-500 hover:bg-neutral-600">
                Salah
              </th>
              {Object.keys(salahTimes).map((salah) => (
                <th
                  key={salah}
                  className="px-4 py-2 text-center border bg-gray-500 hover:bg-neutral-600 "
                >
                  {" "}
                  {salah}{" "}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th className="px-4 py-2 text-center border hover:bg-neutral-600">
                Time
              </th>
              {Object.values(salahTimes).map((time, index) => (
                <td
                  key={index}
                  className="px-4 py-2 text-center border hover:bg-neutral-600"
                >
                  {" "}
                  {time}{" "}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    );
  };
  // actual set up for webpage
  return (
    <>
      <div className="flex flex-row justify-between items-start px-4 pt-8 pb-4 space-x-8">
        {/* Map Section with overlay text */}
        <div className="relative w-[60%] h-[500px]">
          {/* Overlay Text */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10 bg-white bg-opacity-10 px-4 py-1 rounded shadow text-black">
            <b>Drag the marker anywhere to get Salah Times</b>
          </div>

          {/* Actual Map */}
          <div id="map" className="h-full w-full rounded shadow" />
        </div>

        {/* Input Form */}
        <form onSubmit={OnSubmit} className="flex flex-col space-y-4 w-1/3">
          <h1 className="text-3xl font-bold">Salah Time Map</h1>
          <p className="text-gray-600">
            Enter a city and country to view Salah times.
          </p>
          <input
            type="text"
            id="city"
            placeholder="Enter city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="p-2 border border-gray-300 rounded"
            required
          />
          <input
            type="text"
            id="state"
            placeholder="Enter State"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="p-2 border border-gray-300 rounded"
          />
          <input
            type="text"
            id="country"
            placeholder="Enter Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="p-2 border border-gray-300 rounded"
            required
          />
          <input
            type="submit"
            className="p-2 border border-gray-300 rounded cursor-pointer"
          />
        </form>
      </div>

      <div className="mt-8 flex justify-center">
        {salahTimes && CreateTable(salahTimes)}
      </div>
    </>
  );
}
