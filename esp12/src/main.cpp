/*
  Salo Lamp Project
*/

#include <FS.h>
#include <ESP8266WiFi.h>
#include <DNSServer.h>
#include <ESP8266WebServer.h>
#include <WiFiManager.h>
#include <ThingerWebConfig.h>

// Debug
#define _DEBUG_

// Auto Config
ThingerWebConfig thing;

// Pins
const int leds[4] = {13,12,14,16}; // RED(D7) - GREEN(D6) - BLUE(D5) - WHITE(D0)
const int reset = 0;

// Variables
int color[4] = {0,0,0,0}; // red green blue white

void setup()
{
  // Serial YO!
  Serial.begin(115200);
  Serial.println("Sale lamp starting...");

  //Reset option
  if(reset==1)
  {
    Serial.println("RESET ON!");
    WiFiManager wifiManager;
    wifiManager.resetSettings();
  }

  // Everytime a websocket msg is received
  thing["colors"] << [](pson& in){
    color[0] = in["red"];
    color[1] = in["green"];
    color[2] = in["blue"];
    color[3] = in["white"];

    Serial.print(millis());
    Serial.print(" - Red: ");
    Serial.print(color[0]);
    Serial.print(" - Green: ");
    Serial.print(color[1]);
    Serial.print(" - Blue: ");
    Serial.print(color[2]);
    Serial.print(" - White: ");
    Serial.println(color[3]);
  };

}

void loop()
{
  thing.handle();
}
