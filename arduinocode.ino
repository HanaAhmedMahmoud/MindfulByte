#include <Arduino.h>
#include <SPI.h>
#include <Adafruit_BluefruitLE_SPI.h>
#include <Wire.h>
#include "LSM303D.h" 

/* Feather 32u4 Bluefruit LE SPI pins */
#define BLUEFRUIT_SPI_CS   8
#define BLUEFRUIT_SPI_IRQ  7
#define BLUEFRUIT_SPI_RST  4

Adafruit_BluefruitLE_SPI ble(
  BLUEFRUIT_SPI_CS,
  BLUEFRUIT_SPI_IRQ,
  BLUEFRUIT_SPI_RST
);

/* Create the sensor object */
LSM303D component;
int16_t accel[3];  // accerlation values 
float realAccel[3];  // calc accelration 

void setup() {
  char rtn = 0;

  Serial.begin(115200);

  Serial.println("Starting BLE...");

  if (!ble.begin(false)) {
    Serial.println("Couldn't find Bluefruit");
    while (1);
  }

  Serial.println("BLE found!");

  ble.factoryReset();
  ble.echo(false);

  ble.setMode(BLUEFRUIT_MODE_DATA);

  Serial.println("Ready");

  //set up accelerometer 
  Wire.begin();
  Serial.println("\r\npower on");
  rtn = component.initI2C();
  Serial.println(rtn);
  if (rtn != 0) { //check if its on 
      Serial.println("\r\nLSM303D is not found");
      while (1);
  } else {
      Serial.println("\r\nLSM303D is found");
  }
}

void loop() {

  //get accelerometer readings 
  component.getAccel(accel);

  //get real acceleometer
  for (int i = 0; i < 3; i++) {
    realAccel[i] = accel[i] / pow(2, 15) * ACCELE_SCALE;  
  }
  
  ble.println(
      String(realAccel[0], 3) + "," + 
      String(realAccel[1], 3) + "," + 
      String(realAccel[2], 3)
  );

  delay(2000);
}
