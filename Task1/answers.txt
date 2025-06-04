#1 What is HTML? Give basic structure of the HTML page. 
=> HTML stands for HyperText Markup Language. It is used to  create web pages. Basically, it tells the browser how  text, images, links, and other elements on a webpage should be displayed.
<!DOCTYPE html>
<html>
  <head>
    <title>My First Page</title>
  </head>
  <body>
    
  </body>
</html>

<!DOCTYPE html> – Tells the browser, "This is an HTML document."

<html> – Wraps the entire content of the page.

<head> – Contains info about the page like the title, styles, etc.

<title> – The name of the page.

<body> – Everything inside here is visible on the page

#2 Difference between inline and block level element. 
=>Block-level elements take up the full width available by default across the container.They stack vertically one below the other.
Examples: <div>, <p>.
Inline elements only take up as much width as needed by their content.
They sit side by side with other inline elements on the same line.
Examples: <a>, <img>.


CSS Task  

#1 Explain the different ways in which CSS can be applied to HTML, what is the preferred way and why. 
=> Different types
Inline CSS, write CSS directly inside an HTML tag using the style attribute.
eg : <p style="color: blue;">This is blue text.</p>

Internal CSS write CSS inside a <style> tag within the <head> section of your HTML page.
eg : <head>
  <style>
    p {
      color: red;
    }
  </style>
</head>

External CSS, write CSS in a separate .css file and link it to your HTML page using the <link> tag.
<head>
  <link rel="stylesheet" href="styles.css">
</head>
style.css will have the same content written in the <style><style/> tag


#2 What are different CSS selectors, with example explain Element, Class and Id selectors. 
=>Element Selector selects all elements of a given tag name
p(element name) {
  color: red;
}

Class Selector selects all elements that have a specific class attribute.a dot . followed by the class name.
.highlight {
  color: red;
}

ID Selector selects one unique element with a specific id attribute,a hash # followed by the ID name.
#idname {
  color: red;
}
External CSS is preferred because it keeps code organized, reusable, and easier to maintain when  projects grow bigger.

Java script task

#1 List down ways in which JavaScript command can be added to a webpage, what is the preferred way. 
=>
Inline JavaScript : write JavaScript directly inside an HTML element using the event attributes.
<button onclick="alert('Hello!')">Click me</button>

Internal JavaScript: write JavaScript inside a <script> tag placed within the <head> or <body> of the HTML page.
<script>
  function greet() {
    alert('Hello from internal JS!');
  }
</script>

External JavaScript: write JavaScript in a separate .js file and link it using a <script> tag with the src attribute.
<script src="script.js"></script>

External JavaScript is preferred because it keeps code organized, reusable, and easier to maintain when  projects grow bigger.