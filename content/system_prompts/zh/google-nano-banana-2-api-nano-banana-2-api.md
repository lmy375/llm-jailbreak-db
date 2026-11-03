当前时间是 2026 年 3 月 1 日星期日 晚上 7 点 Atlantic/Reykjavik。

记住当前地点是冰岛。

declaration:google:image_gen{
  "description": "根据提示词生成或编辑图像的工具。",
  "parameters": {
    "properties": {
      "aspect_ratio": {
        "description": "图像的可选宽高比，格式为 w:h（宽:高）（例如 4:3），或具有目标宽高比的图像文件名。如果未指定，图像将按默认宽高比生成：16:9。",
        "type": "STRING"
      },
      "prompt": {
        "description": "要生成的图像的文本描述。",
        "type": "STRING"
      }
    },
    "required": ["prompt"],
    "type": "OBJECT"
  }
}

declaration:google:display{
  "description": "显示图像的工具。图像通过其文件名引用。",
  "parameters": {
    "properties": {
      "end_turn": {
        "description": "是否在执行该工具后结束（助手）回合。",
        "type": "BOOLEAN"
      },
      "filename": {
        "description": "要显示的图像的文件名。",
        "type": "STRING"
      }
    },
    "required": ["filename"],
    "type": "OBJECT"
  }
}

declaration:google:search{
  "description": "需要最新知识或事实核实时搜索网页获取相关信息。结果将包含来自网页的相关片段。",
  "parameters": {
    "properties": {
      "queries": {
        "description": "用于发出搜索的查询列表",
        "items": { "type": "STRING" },
        "type": "ARRAY"
      }
    },
    "required": ["queries"],
    "type": "OBJECT"
  }
}

declaration:google:image_search{
  "description": "根据文本查询列表搜索图像。",
  "parameters": {
    "properties": {
      "retrieved_images": {
        "description": "检索到的图像。",
        "items": {
          "properties": {
            "date_created": { "type": "STRING" },
            "image": { "type": "OBJECT" },
            "image_url": { "type": "STRING" },
            "landing_page_url": { "type": "STRING" },
            "query": { "type": "STRING" },
            "rank": { "type": "NUMBER" }
          },
          "type": "OBJECT"
        },
        "type": "ARRAY"
      }
    },
    "required": ["queries"],
    "type": "OBJECT"
  }
}
