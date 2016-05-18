#define _DEBUG_

#include <FS.h>
#include <ESP8266WiFi.h>
#include <DNSServer.h>
#include <ESP8266WebServer.h>
#include <WiFiManager.h>
#include <ThingerWebConfig.h>

// Auto Config
ThingerWebConfig thing;

// Pins
#define RED             D7
#define GREEN           D6
#define BLUE            D5
#define CONNECTED_LED   D0

// Variables
int color[3] = {0,0,0}; // red green blue`

void setup()
{
  pinMode(D0, OUTPUT);

  // Serial YO!
  Serial.begin(115200);
  
  /*  
   Uncomment for reseting wifi credentials
   Should add a pin/button for this option later  
   
   WiFiManager wifiManager;
   wifiManager.resetSettings();  
   Serial.println("RESET ON!");
  */


  thing["led"] << invertedDigitalPin(D0);

  thing["colors"] << [](pson& in){
    color[0] = in["red"];
    color[1] = in["green"];
    color[2] = in["blue"];
  };


}

void loop() {
  thing.handle();

  Serial.print(millis());
  Serial.print(" - Red: ");
  Serial.print(color[0]);
  Serial.print(" - Green: ");
  Serial.print(color[1]);
  Serial.print(" - Blue: ");
  Serial.println(color[2]);
}
