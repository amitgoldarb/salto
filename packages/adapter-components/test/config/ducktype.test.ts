/*
*                      Copyright 2021 Salto Labs Ltd.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with
* the License.  You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
import { ObjectType, BuiltinTypes, MapType } from '@salto-io/adapter-api'
import { createDucktypeAdapterApiConfigType, createUserFetchConfigType, validateDuckTypeFetchConfig } from '../../src/config'

describe('config_ducktype', () => {
  describe('createAdapterApiConfigType', () => {
    it('should return default config type when no custom fields were added', () => {
      const configType = createDucktypeAdapterApiConfigType({ adapter: 'myAdapter' })
      expect(Object.keys(configType.fields)).toHaveLength(3)
      expect(configType.fields.types).toBeDefined()
      expect(configType.fields.typeDefaults).toBeDefined()
      expect(configType.fields.apiVersion).toBeDefined()
      const types = configType.fields.types.type as MapType
      expect(types).toBeInstanceOf(MapType)
      const typesInner = types.innerType as ObjectType
      expect(typesInner).toBeInstanceOf(ObjectType)
      expect(new Set(Object.keys(typesInner.fields))).toEqual(new Set(['request', 'transformation']))
      const request = typesInner.fields.request.type as ObjectType
      const transformation = typesInner.fields.transformation.type as ObjectType
      expect(request).toBeInstanceOf(ObjectType)
      expect(transformation).toBeInstanceOf(ObjectType)
      const typeDefaults = configType.fields.typeDefaults.type as ObjectType
      expect(typeDefaults).toBeInstanceOf(ObjectType)
      expect(new Set(Object.keys(typeDefaults.fields))).toEqual(new Set(['request', 'transformation']))
      const requestDefaults = typesInner.fields.request.type as ObjectType
      const transformationDefaults = typesInner.fields.transformation.type as ObjectType
      expect(requestDefaults).toBeInstanceOf(ObjectType)
      expect(transformationDefaults).toBeInstanceOf(ObjectType)
    })

    it('should include additional fields when added', () => {
      const configType = createDucktypeAdapterApiConfigType({
        adapter: 'myAdapter',
        additionalRequestFields: { a: { type: BuiltinTypes.STRING } },
        additionalTransformationFields: { b: { type: BuiltinTypes.NUMBER } },
      })
      expect(Object.keys(configType.fields)).toHaveLength(3)
      expect(configType.fields.types).toBeDefined()
      expect(configType.fields.typeDefaults).toBeDefined()
      expect(configType.fields.apiVersion).toBeDefined()
      const types = configType.fields.types.type as MapType
      expect(types).toBeInstanceOf(MapType)
      const typesInner = types.innerType as ObjectType
      expect(typesInner).toBeInstanceOf(ObjectType)
      expect(new Set(Object.keys(typesInner.fields))).toEqual(new Set(['request', 'transformation']))
      const request = typesInner.fields.request.type as ObjectType
      const transformation = typesInner.fields.transformation.type as ObjectType
      expect(request).toBeInstanceOf(ObjectType)
      expect(transformation).toBeInstanceOf(ObjectType)
      expect(request.fields.a).toBeDefined()
      expect(transformation.fields.b).toBeDefined()
      expect(transformation.fields.a).toBeUndefined()
      const typeDefaults = configType.fields.typeDefaults.type as ObjectType
      expect(typeDefaults).toBeInstanceOf(ObjectType)
      expect(new Set(Object.keys(typeDefaults.fields))).toEqual(new Set(['request', 'transformation']))
      const requestDefaults = typesInner.fields.request.type as ObjectType
      const transformationDefaults = typesInner.fields.transformation.type as ObjectType
      expect(requestDefaults).toBeInstanceOf(ObjectType)
      expect(transformationDefaults).toBeInstanceOf(ObjectType)
      expect(requestDefaults.fields.a).toBeDefined()
      expect(transformationDefaults.fields.b).toBeDefined()
      expect(transformationDefaults.fields.a).toBeUndefined()
    })
  })

  describe('createUserFetchConfigType', () => {
    it('should return default type when no custom fields were added', () => {
      const type = createUserFetchConfigType('myAdapter')
      expect(Object.keys(type.fields)).toHaveLength(1)
      expect(type.fields.includeTypes).toBeDefined()
    })
  })

  describe('validateFetchConfig', () => {
    it('should validate successfully when values are valid', () => {
      expect(() => validateDuckTypeFetchConfig(
        'PATH',
        {
          includeTypes: ['a', 'bla'],
        },
        {
          typeDefaults: {
            transformation: {
              idFields: ['id'],
            },
          },
          types: {
            a: {
              request: {
                url: '/x/a',
              },
            },
            bla: {
              request: {
                url: '/bla',
              },
            },
          },
        },
      )).not.toThrow()
    })
    it('should throw when there are invalid includeTypes', () => {
      expect(() => validateDuckTypeFetchConfig(
        'PATH',
        {
          includeTypes: ['a', 'unknown'],
        },
        {
          typeDefaults: {
            transformation: {
              idFields: ['id'],
            },
          },
          types: {
            a: {
              request: {
                url: '/x/a',
              },
            },
            bla: {
              request: {
                url: '/bla',
              },
            },
          },
        },
      )).toThrow(new Error('Invalid type names in PATH: unknown'))
    })
  })
})
