---
title: Pothole Detection UG Project
date: 2025-07-01
pinned: false
slug: pothole-detection-ug-project
categories: 
    - Article
    - personal-update
    - projects
tags: [Project, ML, CV]
description: A detailed overview of my undergraduate project on pothole detection using machine learning and computer vision techniques, including the challenges faced and the solutions implemented.
---

# PHD_FYP
A web app for The Pot Hole Detection on images and open CV and TensorFlow.

The web app would include a way to upload the image that the user took of the pothole at certain location and our model would predict if there exist any pothole  and then updates the database. So, that whenever Other person logs into the webpage, he will be notified that there is a pothole day by showing the marker over the location that the picture was taken.

By using this markers on the location one could easily find out that the road that they are taking Contains a pothole, so They can slow down the vehicle or if they really want to avoid such potholes and don't, Make any damage to the vehicle, They could take another path which has the less potholes. 

## Testing custom images

extract [the zip file](https://1drv.ms/u/s!AhCzSwMWU4mgjWNg2IixRGDqSpdw?e=zSWaGJ) into ` training_demo\` folder & then run

extract 'exported_models' into ` training_demo\` folder. (be careful while extracting, it should not create 'exported_models' folder 2 times)

install python-3.9.X  ( prefer 3.9.12 )
go to the root folder of the project and run the command below (it is recommended to use a venv for testing the project)

## Anaconda

install the anaconda to make the env creation easy [Download Here!](https://www.anaconda.com/)

### setting up
open the Anaconda Command Prompt or Anaconda Powershell Prompt after installtion 

Navigate to project dir 
```
cd <PATH>\PHD_FYP
```

### Creating v-env to run project
```
conda create --name phd_fyp python==3.9.12
conda activate phd_fyp
```

### NOTE : POSSIBLE ERROR while running the app 

The tensorflow usual throws an error as tf.gfile.GFile not found or tf has no attribute named gfile.
check reslving techniques here in 

* [StackOverflow](https://stackoverflow.com/questions/55591437/attributeerror-module-tensorflow-has-no-attribute-gfile#:~:text=33-,in%202.0%2C%20tf.gfile.*%20is%20replaced%20by%20tf.io.gfile.*.,-when%20I%20get)

* [Tensorflow Issues](https://github.com/tensorflow/tensorflow/issues/31315#:~:text=i%20solved%20the%20error%20by%20replacing%20tf.gfile.fastgfile%20to%20tf.io.gfile.gfile.)

simply ,  ***Replace tf.gfile.GFile to tf.io.gfile.GFile at line number 137***

## End User Product

### Setup 
the setup file is also included with requirements.txt, but _I have wrote the script_ in such a way that it ensures all the dependencies are installed on FIRST TIME RUN , ALL AT ONCE and no more installing or configuring is required except for the mentioned above

Note : if one wants to delete entire database run `python main.py`, which deletes all the entries till now.

## Web App

make sure you are in root directory i.e, `PHD_FYP` and extracted the zip file into ` training_demo\` so that the structure will be ` training_demo\exported-models\models\` (be careful since it might be the case that it extracts ` training_demo\exported-models\exported-models\models\` if it's a windows OS)

```
python app.py
```

go to the web link it provides probably [http://127.0.0.1:8080/](http://127.0.0.1:8080/) , or better open which flask provides dynamically

### web app interface images

#### Running app

![DEMO_WEBAPP_run.png](DEMO_WEBAPP_run.png)

#### website walk through

![DEMO_WEBAPP_1.png](DEMO_WEBAPP_1.png)
![DEMO_WEBAPP_2.png](DEMO_WEBAPP_2.png)
![DEMO_WEBAPP_3.png](DEMO_WEBAPP_3.png)

#### Results - WEB app

![DEMO_WEBAPP_4.png](DEMO_WEBAPP_4.png)

## Running app in mobile

#### website walk through in mobile

Demo  |  Images  
:-------------------------:|:-------------------------:|
![DEMO_MOBILE_WEB_APP_1.jpg](DEMO_MOBILE_WEB_APP_1.jpg) | ![DEMO_MOBILE_WEB_APP_3.jpg](DEMO_MOBILE_WEB_APP_3.jpg) 
![DEMO_MOBILE_WEB_APP_2.jpg](DEMO_MOBILE_WEB_APP_2.jpg) | ![DEMO_MOBILE_WEB_APP_4.jpg](DEMO_MOBILE_WEB_APP_4.jpg)

#### Results and maps
WEB app in mobile          |  MAPS view in mobile
:-------------------------:|:-------------------------:
![DEMO_MOBILE_WEB_APP_5.jpg](DEMO_MOBILE_WEB_APP_5.jpg) | ![DEMO_MOBILE_WEB_APP_6.jpg](DEMO_MOBILE_WEB_APP_6.jpg)

## Running as a product for an image (CLI)

By running this python script it opens the Input image and the output image generated in separate window.

Note : Replace the <image_path> with the actual image path while running the Script.
```
python Main_CLI.py <image_path>
```


### CLI app interface images

#### running cli app

![DEMO_CLI_OUT_run.png](DEMO_CLI_OUT_run.png)

#### Results - CLI

![DEMO_CLI_OUT.png](DEMO_CLI_OUT.png)
 

## Running as a product for an image (GUI)

Select the image form the drop down and click Run.

```
python Main_GUI.py
```

### GUI app interface images

#### running gui app

![DEMO_GUI_Main_1.png](DEMO_GUI_Main_1.png)

#### Results - GUI

![DEMO_GUI_Main_2_upload.png](DEMO_GUI_Main_2_upload.png)

![DEMO_GUI_Main_3_result.png](DEMO_GUI_Main_3_result.png)

## Build your custom app using our model

Yes, you can integrate pothole detection system into any custom app which is already written as an API in the file named as [phd_api.py](https://github.com/Mahanth-Maha/PHD_FYP/blob/main/phd_api.py).

just import as

```

import phd_api

#create object
phd_run = PHD_API() 

filepath = 'test.jpg'

# use the model
# saves output in /Dataset/Result folder
phd_run.run_phd_and_save_img(input_image_path=filepath)

# alternatively use this to not save result
phd_run.run_phd(input_image_path=filepath)

```

### The Results

the Resulting image will be saved in ` Dataset\Result ` folder

## Demo

Result for an image

### Image

![Original](img00000.JPEG)

### Result

![detected](res_img00000.JPEG)