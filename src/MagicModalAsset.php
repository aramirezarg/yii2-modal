<?php
/**
 * @license http://www.apache.org/licenses/LICENSE-2.0
 */

namespace magicsoft\modal;

use yii\web\AssetBundle;

class MagicModalAsset extends AssetBundle
{
    public $sourcePath = '@vendor/magicsoft/yii2-modal/src/assets';

    public $js = [
		'js/magic.modal.js',
		'js/dependencies/magic.helper.js',
		'js/dependencies/magic.message.js',
		'js/dependencies/spin.js',
		'js/dependencies/jquery.form.js',
		'js/dependencies/beep.js',
    ];

    public $css = [
        'css/modal.css',
    ];

    public $depends = [
        'yii\web\JqueryAsset',
    ];
}
