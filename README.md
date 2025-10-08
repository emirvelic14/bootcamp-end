Weather App
Beskrivning

Det här är en enkel global väderapp som låter användaren söka efter en plats och visa aktuell väderinformation. Appen visar:

Temperatur

Luftfuktighet

Vindhastighet

En ikon som representerar vädertypen (soligt, molnigt, regnigt, snöigt)

Appen använder JavaScript för att hämta data från externa API:er och uppdatera gränssnittet dynamiskt. Den är mobilvänlig och har mjuk scroll på sökresultaten.

Filer i projektet

index.html – Huvudfilen med strukturen för appen

styles.css – Styling för appens layout, färger och animationer

script.js – Funktionalitet, API-anrop och logik för att visa väderdata

images/ – Bilder som representerar olika vädertyper och ikoner

Installation och körning

Ladda ner eller klona projektet till din dator.

Öppna index.html i en webbläsare som Chrome, Firefox eller Safari.

Skriv in en plats i sökfältet och tryck på Enter eller klicka på sökikonen.

Om platsen finns visas vädret direkt. Om platsen inte hittas visas ett felmeddelande.

Ingen server eller installation krävs — appen körs direkt i webbläsaren.

Testning

För att testa att appen fungerar korrekt:

Skriv in kända städer som Stockholm, New York eller Tokyo. Kontrollera att:

Temperatur, vind och fuktighet visas korrekt

Rätt väderikon visas

Skriv in en ogiltig plats, t.ex. “abcxyz”. Kontrollera att meddelandet Oops! Invalid location :/ visas.

Testa på både mobil och desktop för att säkerställa att layouten fungerar responsivt.

Funktioner

Sökfält med autocomplete-liknande matchning

Dynamiska väderikoner baserat på API-data

Mobilvänlig scroll med -webkit-overflow-scrolling: touch

Mjuk animation vid uppdatering av väderinformation
