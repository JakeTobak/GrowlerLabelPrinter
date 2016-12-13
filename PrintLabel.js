(function()
{
    // called when the document completly loaded
    function onload()
    {
        //Populate printer list
        var printers = dymo.label.framework.getPrinters();
        var printerList = document.getElementById('printerList');
        printers.forEach(function(item,index){ 
            var option = document.createElement('option');
            option.value = index;
            option.innerHTML = item.name;
            printerList.appendChild(option);
        });


        var beerID = document.getElementById('beerIDInput');
        var myCanvas = document.getElementById('qrCanvas');
        var base64Div = document.getElementById('base64Div');
        var base64qr;
        var ctx = myCanvas.getContext('2d');
        var img = new Image;

        chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT},
            function(tabs){
                //Fill out the BeerID value in the form (Beer ID is last item in URL)
                var url = tabs[0].url;
                var urlArray = url.split('/');
                document.getElementById('beerIDInput').value = urlArray[urlArray.length - 1];

                //This needs to be done so the canvas doesn't become "tainted"
                img.setAttribute('crossOrigin', 'anonymous');

                //When the QR code image finishes loading, construct the canvas and use it to generate the base64 encoding of the QR code image
                img.onload = function(){
                    myCanvas.height = img.height;
                    myCanvas.width = img.width;
                    ctx.drawImage(img,0,0);
                    //Get the base64 encoding from the canvas and strip the MIME data
                    base64qr = myCanvas.toDataURL("image/png").split(',')[1];
                };
                //Set the source of the QR code image
                img.src = 'http://chart.apis.google.com/chart?chs=240x240&cht=qr&chld=L|0&chl=https%3A%2F%2Funtappd.com%2Fqr%2Fbeer%2F' + beerID.value;

            }
        );
        

        var printButton = document.getElementById('printButton');

        // prints the label
        printButton.onclick = function() {
            try {

                // open label
                var labelXml = '<?xml version="1.0" encoding="utf-8"?>\
<DieCutLabel Version="8.0" Units="twips">\
    <PaperOrientation>Landscape</PaperOrientation>\
    <Id>Address</Id>\
    <PaperName>30252 Address</PaperName>\
    <DrawCommands/>\
    <ObjectInfo>\
        <ImageObject>\
            <Name>QRCODE</Name>\
            <ForeColor Alpha="255" Red="0" Green="0" Blue="0"/>\
            <BackColor Alpha="0" Red="255" Green="255" Blue="255"/>\
            <LinkedObjectName></LinkedObjectName>\
            <Rotation>Rotation0</Rotation>\
            <IsMirrored>False</IsMirrored>\
            <IsVariable>False</IsVariable>\
            <Image></Image>\
            <ScaleMode>Uniform</ScaleMode>\
            <BorderWidth>0</BorderWidth>\
            <BorderColor Alpha="255" Red="0" Green="0" Blue="0"/>\
            <HorizontalAlignment>Center</HorizontalAlignment>\
            <VerticalAlignment>Center</VerticalAlignment>\
        </ImageObject>\
        <Bounds X="3007.519" Y="80.96345" Width="1463.984" Height="1411.837"/>\
    </ObjectInfo>\
</DieCutLabel>';
                var label = dymo.label.framework.openLabelXml(labelXml);
                label.setObjectText('QRCODE', base64qr);


                var pngData = label.render("image/png");
/*
                var labelImage = document.getElementById('labelImage');
                labelImage.src = "data:image/png;base64," + pngData; 
*/
                // select printer to print on
                // for simplicity sake just use the first LabelWriter printer
                var printers = dymo.label.framework.getPrinters();
                if (printers.length == 0)
                    throw "No DYMO printers are installed. Install DYMO printers.";

                var printerName = "";
                for (var i = 0; i < printers.length; i++)
                {
                    var printer = printers[i];
                    if (printer.printerType == "LabelWriterPrinter")
                    {
                        printerName = printer.name;
                        break;
                    }
                }
                if (printerName == "")
                    throw "No LabelWriter printers found. Install LabelWriter printer";

                // finally print the label
//                label.print(printerName);


            }
            catch(e)
            {
                alert(e.message || e);
            }
        }
    };

   function initTests()
	{
		if(dymo.label.framework.init)
		{
			//dymo.label.framework.trace = true;
			dymo.label.framework.init(onload);
		} else {
			onload();
		}
	}

	// register onload event
	if (window.addEventListener)
		window.addEventListener("load", initTests, false);
	else if (window.attachEvent)
		window.attachEvent("onload", initTests);
	else
		window.onload = initTests;

} ());

