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
| options.timeout | <code>integer</code> | Callback timeout in milliesconds |
| options.onUnknownKey | <code>function</code> | Function to be executed when instructed to unstash an unknown (or expired) key. |
| options.onDuplicateKey | <code>function</code> | Function to be executed when instructed to stash a duplicate key. |
| options.onExpiry | <code>function</code> | Function to be executed after expiring a key. |

<a name="module_stashback--module.exports..stash"></a>
#### module.exports~stash
Stashes a callback for subsequent retrieval

**Kind**: inner property of <code>[module.exports](#exp_module_stashback--module.exports)</code>  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | The callback id |
| callback | <code>function</code> | The callback to be stashed |
| options | <code>Object</code> |  |
| options.onDuplicateKey | <code>function</code> | Function to be executed when instructed to stash a duplicate key. |
| options.onExpiry | <code>function</code> | Function to be executed after expiring a key. |
| next | <code>callback</code> | Callback which will be excuted with the error object |

<a name="module_stashback--module.exports..unstash"></a>
#### module.exports~unstash
Unstashes a callback for execution

**Kind**: inner property of <code>[module.exports](#exp_module_stashback--module.exports)</code>  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | The callback id |
| options | <code>Object</code> |  |
| options.onUnknownKey | <code>function</code> | Function to be executed when instructed to unstash an unknown (or expired) key. |
| options.onExpiry | <code>function</code> | Function to be executed after expiring a key. |
| next | <code>callback</code> | Callback which will be executed with the error object and the callback (or no-op function if the callback was not found or has expired) |

<a name="module_stashback--module.exports..stats"></a>
#### module.exports~stats ⇒ <code>Object</code>
Provides statistics

**Kind**: inner property of <code>[module.exports](#exp_module_stashback--module.exports)</code>  
**Returns**: <code>Object</code> - stats                 An object containing the number of stashed and expired callbacks  
