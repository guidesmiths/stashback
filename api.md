<a name="module_stashback"></a>
## stashback
A library for stashing and retrieving callbacks


* [stashback](#module_stashback)
  * [module.exports(options)](#exp_module_stashback--module.exports) ⏏
    * [~stash](#module_stashback--module.exports..stash)
    * [~unstash](#module_stashback--module.exports..unstash)
    * [~stats](#module_stashback--module.exports..stats) ⇒ <code>Object</code>

<a name="exp_module_stashback--module.exports"></a>
### module.exports(options) ⏏
Returns a configured stashback object

**Kind**: Exported function  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| options.timeout | <code>milliseconds</code> | This timeout is applied to the callback being stashed. If the timeout is exceeded the callback is executed with an error object. |
| options.onUnknownKey | <code>function</code> | Function to be executed when instructed to unstash an unknown (or expired) key. Will be invoked with the key and next parameters. |
| options.onDuplicateKey | <code>function</code> | Function to be executed when instructed to stash a duplicate key. Will be invoked with the key and next parameters. |
| options.onExpiry | <code>function</code> | Function to be executed after expiring a key. Will be invoked with the key and callback to be expired. |

<a name="module_stashback--module.exports..stash"></a>
#### module.exports~stash
Stashes a callback for subsequent retrieval

**Kind**: inner property of <code>[module.exports](#exp_module_stashback--module.exports)</code>  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | The callback id |
| callback | <code>function</code> | The callback to be stashed |
| options | <code>Object</code> |  |
| options.timeout | <code>milliseconds</code> | This timeout is applied to the callback being stashed. If the timeout is exceeded the callback is executed with an error object. |
| options.onDuplicateKey | <code>function</code> | Function to be executed when instructed to stash a duplicate key. Will be invoked with the key and next parameters. |
| options.onExpiry | <code>function</code> | Function to be executed after expiring a key. Will be invoked with the key and next parameters. |
| next | <code>callback</code> | Callback which will be invoked with the error object |

<a name="module_stashback--module.exports..unstash"></a>
#### module.exports~unstash
Unstashes a callback for execution

**Kind**: inner property of <code>[module.exports](#exp_module_stashback--module.exports)</code>  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | The callback id |
| options | <code>Object</code> |  |
| options.onUnknownKey | <code>function</code> | Function to be executed when instructed to unstash an unknown (or expired) key. Will be invoked with the key and next parameters. |
| next | <code>callback</code> | Callback which will be invoked with the error object and the callback (or no-op function if the callback was not found or has expired). |

<a name="module_stashback--module.exports..stats"></a>
#### module.exports~stats ⇒ <code>Object</code>
Provides statistics

**Kind**: inner property of <code>[module.exports](#exp_module_stashback--module.exports)</code>  
**Returns**: <code>Object</code> - stats                 An object containing the number of stashed and expired callbacks  
