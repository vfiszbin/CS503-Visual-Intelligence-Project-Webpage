<p align="center">
  <img src="assets/epfl_logo.svg" alt="description" width="200">
</p>
<h1 align="center">EPFL CS503 - Visual Intelligence<br>Machine and Minds <br>Course Project Website Template</h1>

This repository contains the template code for preparing final project reports using GitHub Page. 

## Steps to Use the Template
Follow the given steps to clone the repository to your local and publish on the website afterwards. 

### 1 - Clone and Edit the Repository 
```bash
git clone https://github.com/EPFL-VILAB/cs503-project-webpage-template.git
```
After cloning the repository, make changes in the file `index.html` to modify your website as you wish. The parts that can be edited are labeled with following blocks: 

```html
<!--TODO: CODE BLOCK DESCRIPTION-->


<!-------------------------------->
```

The `static` folder can be used for storing images, gifs, videos and other content that can be used in the report for reporting. 

The page sections live in the `sections` folder and are loaded into `index.html` at runtime. When previewing locally, serve the repository with a local web server instead of opening `index.html` directly, for example:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

After making the edits update the repository and commit your changes. 

### 2 - Publish the Website on GitHub Pages
The website can be published following the given steps: 

1. Go to _Settings_ in of the repository and select _Pages_ under the group _Code and Automation_ from the left corner options. 

2. Select the source as _Deploy from a branch_ 

3. Wait for some time and you can see the first deployment following the provided link at your domain 🎉.

4. Afterwards, your commits will update the website each time. 

The website is available at the following link: https://vfiszbin.github.io/CS503-Visual-Intelligence-Project-Webpage/

---
This template has been taken from [here](https://nerfies.github.io).
