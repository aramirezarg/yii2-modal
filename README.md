Magic Modal {Beta}
============
Magic Modal

Installation
------------

The preferred way to install this extension is through [composer](http://getcomposer.org/download/).

Either run

```
php composer.phar require --prefer-dist magicsoft/yii2-modal "*"
```

or add

```
"magicsoft/yii2-modal": "*"
```

to the require section of your `composer.json` file.


Usage
-----

Once the extension is installed, simply use it in your code by  :

You can use this modal by attributes:
```php
<?php
    Html::a(
        '<span class="glyphicon glyphicon-plus"></span> Create',
        ['country/create'],
        [
            'class' => 'magic-modal btn btn-success',
            'ajaxOptions' => '{"confirmToLoad":true,"confirmToSend":true"confirmToClose":true}',
            'jsFunctions' => ''
        ]
    )
    //ajaxOptions and jsFunctions are optional.
?>
```

##Register assets
In your main: register 
```php
<?php

use magicsoft\modal\MagicModalAsset;

MagicModalAsset::register($this);
```

Or you can use this modal by js:
myModal = new MagicModal(url, ajaxOptions, jsFunctions, 'myModal')