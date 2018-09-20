<?php
/**
 * @license http://www.apache.org/licenses/LICENSE-2.0
 */

namespace magicsoft\modal;

use yii\web\AssetBundle;

class MagicModalAsset extends AssetBundle
{
    public $sourcePath = '@vendor/magicsoft/modal/src/assets/source';

    public $js = [
		'js/magic.modal.js',
        'js/dependencies/accounting.js',
		'js/dependencies/magic.helper.js',
		'js/dependencies/magic.message.js',
		'js/dependencies/spin.js',
		'js/dependencies/jquery.form.js',
		'js/dependencies/beep.js',
		'print/print.js',
        'fingerprint/fingerprint.js',
        'fingerprint/get-finger-print.js'
    ];

    public $css = [
        'css/fileinput.min.css',
        'css/modal.css',
    ];

    public $depends = [
        'yii\web\JqueryAsset',
    ];
}
