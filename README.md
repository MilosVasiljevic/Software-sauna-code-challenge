Submition for Software Sauna code challengde, by Milos Vasiljevic

***

When you open index.html, you can find input box where you can enter or paste your map, and after clicking on "Run" you will get Error message if map is invalid, or Characters and Path response if its valid. 

You can also test maps from task example by open console and typing: runAllTests() 
Maps are stored within code.

Your custom map could also be tested in console with function walk(). Example: walk(["@-A-x"]);

***


Command 

```
node testPreparedMaps.js
```

Tests already prepared maps (taken from task description) and returns if they are valid or not. Invalid maps will also return reason for break.
Test is succesfull if all good maps pass, and all bad maps return its own error.

***


Command 

```
node testCustomMap.js   
```

Enable entry of your own map in terminal, row by row.
At the end of your map, you should add another ENTER to start the test.
If map is valid, test will return collected letters, and path as characters.


