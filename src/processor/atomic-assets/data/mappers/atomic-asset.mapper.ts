import { Mapper } from '@alien-worlds/api-core';
import { AtomicAssetDocument } from './../dtos/atomic-assets.dto';
import { AtomicAsset } from '../../domain/entities/atomic-asset';

/*imports*/

export class AtomicAssetMapper
  implements Mapper<AtomicAsset, AtomicAssetDocument>
{
  public toEntity(document: AtomicAssetDocument): AtomicAsset {
    return AtomicAsset.fromDocument(document);
  }
  public toDataObject(entity: AtomicAsset): AtomicAssetDocument {
    return entity.toDocument();
  }
}
