# from openai import AsyncOpenAI
# import asyncio


# class VLM:
#     def __init__(self, api_key, base_url, timeout):
#         self.client = AsyncOpenAI(api_key=api_key, base_url=base_url, timeout=timeout)

#     async def generate_response(self, messages):
#         response = await self.client.chat.completions.create(
#             model = (await self.client.models.list()).data[0].id,
#             messages=messages
#         )

#         return response





# # async def main():
# #     vlm = VLM(api_key='sk-IrR7Bwxtin0haWagUnPrBgq5PurnUz86', base_url='http://210.115.224.151:31841/v1', timeout= 600)

# #     img_url = '/Users/chaejimin/Desktop/SNU/2-2/하계 방학/classday/vlm-management/image.png'

# #     message=[
# #                 {
# #                     'role':'system',
# #                     # 'content':f'You are an AI specialized in recognizing and extracting text from images. Your mission is to analyze the image document and generate the result in QwenVL Document Parser HTML format using specified tags while maintaining user privacy and data integrity.'
# #                     'content':'너는 이미지에서 텍스트와 수식을 추출하는 모델이야. 추출한 텍스트와 수식을 latex 형식으로 반환해줘.'
# #                 },
# #                 {
# #                     'role':'user',
# #                     'content': [
# #                         {
# #                             'type': 'image_url',  
# #                             'image_url': {
# #                                 'url':
# #                                 img_url,
# #                             },
# #                         },
# #                         {
# #                             'type': 'text',
# #                             'text': f'latex', 
# #                         },
# #                     ],
# #                 }
# #             ]

# #     response = await vlm.generate_response(message)

# #     print(response)


# asyncio.run(main())


from openai import AsyncOpenAI
import asyncio
import base64

class VLM:

    def __init__(self, api_key, base_url, timeout):
        self.client = AsyncOpenAI(api_key=api_key, base_url=base_url, timeout=timeout)



    async def generate_response(self, messages):
        # 모델 이름을 직접 지정하는 것이 더 안정적일 수 있습니다.
        # 사용 가능한 모델 목록을 확인하고 비전 모델의 이름을 직접 입력하는 것을 권장합니다.
        # 예: model='qwen-vl-max'
        response = await self.client.chat.completions.create(
            model=(await self.client.models.list()).data[0].id,
            messages=messages
        )
        print((await self.client.models.list()).data[0].id)
        return response



    def encode_image_to_base64(self, image_path):
        """
        로컬 이미지 파일을 Base64 문자열로 인코딩합니다.
        """
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode("utf-8")

async def main():

    vlm = VLM(api_key='sk-IrR7Bwxtin0haWagUnPrBgq5PurnUz86', base_url='http://210.115.224.151:31841/v1', timeout=600)

    img_url = vlm.encode_image_to_base64('/Users/chaejimin/Desktop/SNU/2-2/하계 방학/classday/vlm-management/image copy 3.png') # 예시 URL

    message = [
        {
            'role': 'system',
            'content': '너는 이미지에서 텍스트와 수식을 인식하는 전문 AI야. 주어진 이미지를 분석하고, 모든 수학 수식은 LaTeX 형식으로 올바르게 변환하여 HTML 형식으로 결과를 생성해줘.'
        },
        {
            'role': 'user',
            'content': [
                {
                    'type': 'image_url',
                    'image_url': {
                        'url': f'data:image/png;base64,{img_url}',
                    },
                },
                {
                    'type': 'text',
                    'text': '이미지에서 문제를 추출해줘.'
                },
            ],
        }
    ]

    response = await vlm.generate_response(message)

    if response.choices:
        print(response.choices[0].message.content)
    else:
        print("응답에서 내용을 찾을 수 없습니다.")

# 스크립트 실행
asyncio.run(main())